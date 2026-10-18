#!/usr/bin/env node
/**
 * Encodes the journey clips into web versions for the scroll scrubbed background.
 *
 *   node scripts/optimize-videos.mjs [--src public/journey/clips] [--out public/journey/web]
 *                                    [--mp4-crf 24] [--webm-crf 28] [--only 03,journey] [--force]
 *
 * Reads 01.mp4 ... 05.mp4 and the joined journey.mp4 (never modifies them) and writes, per size:
 *   <name>-1080.mp4 / <name>-720.mp4    H.264 High, yuv420p, faststart
 *   <name>-1080.webm / <name>-720.webm  VP9, two pass constant quality (-b:v 0)
 *   journey-1080.jpg / journey-720.jpg  poster from the first frame
 *
 * Scrubbing moves the video backward as often as forward, so every frame is a
 * keyframe (-g 1), with no B-frames and no VP9 hidden alt-ref frames. No audio.
 *
 * Default quality came from a VMAF sweep plus side by side crops on these clips:
 * H.264 CRF 24 and VP9 two pass CRF 28 are the last steps before the wall
 * texture smears. One pass VP9 needs about CRF 41 to look the same and comes
 * out larger, which is why it runs two passes.
 *
 * Outputs newer than their source are skipped, so replacing one clip only
 * re-encodes that clip and the joined video. If a clip is newer than
 * journey.mp4, the joined outputs are built from the five clips directly
 * (journey.mp4 itself stays untouched). --force re-encodes everything.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLIPS = ['01', '02', '03', '04', '05'];
const JOINED = 'journey';
const SIZES = [
  { name: '1080', width: 1920, height: 1080 },
  { name: '720', width: 1280, height: 720 },
];

const { values: args } = parseArgs({
  options: {
    src: { type: 'string', default: 'public/journey/clips' },
    out: { type: 'string', default: 'public/journey/web' },
    'mp4-crf': { type: 'string', default: '24' },
    'webm-crf': { type: 'string', default: '28' },
    only: { type: 'string' },
    force: { type: 'boolean', default: false },
  },
});

const srcDir = path.resolve(root, args.src);
const outDir = path.resolve(root, args.out);
const only = args.only ? new Set(args.only.split(',').map((name) => name.trim())) : null;

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 1 << 26 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed:\n${result.stderr.slice(-2000)}`);
  return result.stdout;
}

function probe(file, entries, extra = []) {
  return JSON.parse(run('ffprobe', ['-v', 'error', ...extra, '-show_entries', entries, '-of', 'json', file]));
}

const mtime = (file) => statSync(file).mtimeMs;
const mb = (file) => statSync(file).size / 1048576;

try {
  run('ffmpeg', ['-version']);
  run('ffprobe', ['-version']);
} catch {
  console.error('ffmpeg/ffprobe not found. Install it (macOS: brew install ffmpeg).');
  process.exit(1);
}

// --- Sources: each clip, plus the joined video (or the clips joined on the fly when it is stale). ---
const clipFiles = CLIPS.map((name) => path.join(srcDir, `${name}.mp4`));
const missing = clipFiles.filter((file) => !existsSync(file)).map((file) => path.basename(file));
const joinedFile = path.join(srcDir, `${JOINED}.mp4`);

const sources = CLIPS.map((name, i) => ({ name, inputs: [clipFiles[i]], original: clipFiles[i] })).filter((s) =>
  existsSync(s.original),
);

if (missing.length === 0) {
  const stale = !existsSync(joinedFile) || clipFiles.some((file) => mtime(file) > mtime(joinedFile));
  if (stale) {
    console.warn(`${JOINED}.mp4 is missing or older than a clip; joining the five clips directly instead.`);
    sources.push({ name: JOINED, inputs: clipFiles, original: null });
  } else {
    sources.push({ name: JOINED, inputs: [joinedFile], original: joinedFile });
  }
} else {
  console.warn(`Missing in ${path.relative(root, srcDir)}/: ${missing.join(', ')}.`);
  if (existsSync(joinedFile)) sources.push({ name: JOINED, inputs: [joinedFile], original: joinedFile });
}

const selected = sources.filter((s) => !only || only.has(s.name));
if (selected.length === 0) {
  console.error('Nothing to encode.');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const work = mkdtempSync(path.join(tmpdir(), 'journey-web-'));

/** ffmpeg input flags plus the filter chain head that feeds one or more inputs into [v]. */
function inputArgs(source, size) {
  const scale = `scale=${size.width}:${size.height}:flags=lanczos,setsar=1`;
  const inputs = source.inputs.flatMap((file) => ['-i', file]);
  if (source.inputs.length === 1) return [...inputs, '-vf', scale];
  const joined = source.inputs.map((_, i) => `[${i}:v]`).join('');
  return [...inputs, '-filter_complex', `${joined}concat=n=${source.inputs.length}:v=1:a=0,${scale}[v]`, '-map', '[v]'];
}

function needsWork(output, source) {
  if (args.force || !existsSync(output)) return true;
  return source.inputs.some((file) => mtime(file) > mtime(output));
}

function encodeMp4(source, size, output) {
  run('ffmpeg', [
    '-v', 'error', '-y', ...inputArgs(source, size), '-an',
    '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-crf', args['mp4-crf'],
    '-g', '1', '-keyint_min', '1', '-bf', '0',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output,
  ]);
}

function encodeWebm(source, size, output) {
  const passlog = path.join(work, `${source.name}-${size.name}`);
  const common = [
    '-c:v', 'libvpx-vp9', '-crf', args['webm-crf'], '-b:v', '0',
    '-g', '1', '-keyint_min', '1', '-auto-alt-ref', '0', '-lag-in-frames', '0',
    '-row-mt', '1', '-tile-columns', '2', '-deadline', 'good', '-pix_fmt', 'yuv420p', '-passlogfile', passlog,
  ];
  run('ffmpeg', ['-v', 'error', '-y', ...inputArgs(source, size), '-an', ...common, '-cpu-used', '4', '-pass', '1', '-f', 'null', '-']);
  run('ffmpeg', [
    '-v', 'error', '-y', ...inputArgs(source, size), '-an', ...common, '-cpu-used', '2', '-pass', '2',
    '-cues_to_front', '1', output,
  ]);
}

async function poster(source, size, output) {
  const png = path.join(work, `poster-${size.name}.png`);
  run('ffmpeg', ['-v', 'error', '-y', '-i', source.inputs[0], '-vf', `scale=${size.width}:${size.height}:flags=lanczos`, '-frames:v', '1', png]);
  await sharp(png).jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(output);
}

// --- Checks: no audio, a keyframe on every frame, starts at zero, MP4 index up front. ---
function moovFirst(file) {
  const head = readFileSync(file).subarray(0, 1 << 16);
  let offset = 0;
  while (offset + 8 <= head.length) {
    const size = head.readUInt32BE(offset);
    const type = head.toString('latin1', offset + 4, offset + 8);
    if (type === 'moov') return true;
    if (type === 'mdat' || size < 8) return false;
    offset += size;
  }
  return false;
}

function check(file, expectedFrames) {
  const { streams, format } = probe(file, 'stream=codec_type,codec_name,level,width,height:format=start_time');
  const audio = streams.filter((s) => s.codec_type !== 'video');
  const video = streams.find((s) => s.codec_type === 'video');
  const frames = Number(probe(file, 'stream=nb_read_frames', ['-select_streams', 'v:0', '-count_frames']).streams[0].nb_read_frames);
  const keyframes = Number(
    probe(file, 'stream=nb_read_frames', ['-select_streams', 'v:0', '-skip_frame', 'nokey', '-count_frames']).streams[0].nb_read_frames,
  );
  // Decoding the very first frame proves playback can start at t=0.
  run('ffmpeg', ['-v', 'error', '-i', file, '-frames:v', '1', '-f', 'null', '-']);

  const problems = [];
  if (audio.length > 0) problems.push(`${audio.length} non video stream(s)`);
  if (keyframes !== frames) problems.push(`${frames - keyframes} non key frames`);
  if (expectedFrames && frames !== expectedFrames) problems.push(`${frames} frames, expected ${expectedFrames}`);
  if (Math.abs(Number(format.start_time)) > 0.001) problems.push(`starts at ${format.start_time}s`);
  if (file.endsWith('.mp4') && !moovFirst(file)) problems.push('moov is not at the front');

  // The RFC 6381 string for <source type>: High profile (64), no constraints (00), level in hex.
  const codec = video.codec_name === 'h264' ? `avc1.6400${video.level.toString(16).toUpperCase()}` : video.codec_name;
  return { width: video.width, height: video.height, codec, frames, problems };
}

function sourceFrames(source) {
  return source.inputs.reduce(
    (sum, file) => sum + Number(probe(file, 'stream=nb_frames', ['-select_streams', 'v:0']).streams[0].nb_frames),
    0,
  );
}

// --- Encode. ---
const rows = [];
try {
  for (const source of selected) {
    const expected = sourceFrames(source);
    for (const size of SIZES) {
      const outputs = [
        { file: path.join(outDir, `${source.name}-${size.name}.mp4`), encode: encodeMp4 },
        { file: path.join(outDir, `${source.name}-${size.name}.webm`), encode: encodeWebm },
      ];
      for (const { file, encode } of outputs) {
        const label = path.relative(root, file);
        if (needsWork(file, source)) {
          process.stdout.write(`Encoding ${label} ... `);
          const started = Date.now();
          encode(source, size, file);
          console.log(`${((Date.now() - started) / 1000).toFixed(0)}s`);
        } else {
          console.log(`Up to date: ${label}`);
        }
        rows.push({ source, file, ...check(file, expected) });
      }
      if (source.name === JOINED) {
        const file = path.join(outDir, `${JOINED}-${size.name}.jpg`);
        if (needsWork(file, source)) await poster(source, size, file);
        const { width, height } = await sharp(file).metadata();
        rows.push({ source, file, width, height, codec: 'jpeg', frames: 1, problems: [] });
      }
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

// --- Report. ---
console.log('\n| File | Resolution | Codec | MB | vs original |');
console.log('| --- | --- | --- | --- | --- |');
for (const row of rows) {
  const original = row.source.original;
  const ratio = original && row.codec !== 'jpeg' ? `${((mb(row.file) / mb(original)) * 100).toFixed(0)}% of ${mb(original).toFixed(2)} MB` : '';
  console.log(
    `| ${path.basename(row.file)} | ${row.width}×${row.height} | ${row.codec} | ${mb(row.file).toFixed(2)} | ${ratio} |`,
  );
}

const failed = rows.filter((row) => row.problems.length > 0);
if (failed.length > 0) {
  console.error('\nProblems:');
  for (const row of failed) console.error(`  ${path.basename(row.file)}: ${row.problems.join(', ')}`);
  process.exit(1);
}
const videos = rows.filter((row) => row.codec !== 'jpeg');
console.log(`\nAll ${videos.length} videos: video only, a keyframe on every frame, start at 0s${videos.some((r) => r.file.endsWith('.mp4')) ? ', MP4 index up front' : ''}.`);
