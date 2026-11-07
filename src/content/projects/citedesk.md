---
title: CiteDesk
order: 1
summary: 'A documentation assistant that answers only from a given set of docs, cites the exact passage behind every sentence, and says "I don''t know" when the docs do not cover the question.'
role: 'Solo developer: product, design, retrieval, evals, backend, database and deploy.'
outcome: 'In the lab, with a live demo over the Supabase Database and AI guides: 835 chunks, all 997 citation anchors checked against the live docs, and about $0.0003 to $0.0017 a question. The retrieval scores wait for a 40 question labelled set.'
stack: [Next.js, TypeScript, Supabase, pgvector, OpenAI API, Vercel AI SDK, Langfuse]
live: https://citedesk-olive.vercel.app
repo: https://github.com/Dani0306/citedesk
image: /projects/citedesk.webp
---
## The product

CiteDesk is an "ask the docs" assistant that has to show its work. You ask a question in plain language, and it answers only from a given set of documents, today the Supabase Database and AI guides. Every sentence of the answer ends in a citation marker, and each marker opens the exact passage behind it, with a link to that section of the live docs. When the docs do not cover the question, it says "I don't know" and shows the closest section instead of guessing.

The sources appear before the answer does, so you can start checking while it is still being written. In one headless Chrome run the first source card rendered 1.6 seconds before the first word of the answer.

The product is small on purpose. The other half of the project is the point: an eval suite that measures whether it finds the right passages.

## What happens to a question

- **Hybrid retrieval:** a pgvector similarity search (HNSW, cosine) and a Postgres full text search run side by side, and reciprocal rank fusion merges them. An optional LLM rerank takes the top 50 down to 8. Every stage can be switched on or off and measured on its own.
- **Refusal decided in code:** if the top vector similarity is below the threshold, the answer is "I don't know" and the answer model is never called. A refused question costs one embedding.
- **Citations checked in code:** `gpt-6-luna` streams the answer with `[n]` markers, and code checks that every marker points at a passage that was actually retrieved for that question. "Hallucinated citations: 0" is a count, not an opinion.
- **Every call logged:** tokens, cost and latency go into a `model_calls` table, priced from a dated table, and traces go to Langfuse. Daily caps on answers and reranks are counted from that log.
- **A retrieval playground** at `/playground` shows one question's whole path: each candidate's rank in vector search, full text search, fusion and rerank, whether it reached the model, and whether the answer cited it.

## Decisions that mattered

- **Chunks follow the docs' own headings**, not fixed windows, because a citation has to point at a heading that contains the passage. Sub sections merge up to 800 tokens: 835 chunks, median 166 tokens.
- **Markers instead of a provider's citation feature.** A hosted file search would retrieve with its own index and hide exactly what the project measures.
- **Labels keyed to sections, not row ids**, so changing the chunk size never invalidates a label, and a long section split in two cannot score twice.
- **Prompt caching as a measured bet.** Only exact repeat questions hit the cache, and every new prompt costs 25% more to write it. On four questions per pass, caching pays once more than about 31% of questions are repeats. Four questions measures the mechanism, not a benchmark, and the case study says so.

## What went wrong, and what it taught me

- **A `LIMIT 50` query quietly returned 40 rows.** pgvector's HNSW index caps results at `ef_search`, 40 by default, and nothing errors. The database function now raises it to match the requested count on every call.
- **Keyword search found nothing.** The documented recipe requires every word of the question to match, which matched 0 of 835 chunks for sentence length questions. Matching any word and letting the rank order do the work fixed it.
- **A stub page produced a confident, wrong sourced answer.** The citation was valid, since it pointed at a retrieved passage, but the claim was not supported. That is why citation checks and groundedness judging are two separate numbers.
- **Real docs do not parse the way the framework says.** Citation anchors matched 96.8% on the first pass and 997 of 997 only after reading how the live site actually builds them.

## The eval suite

Recall@k, MRR and nDCG for retrieval, a threshold sweep for the refusal cutoff, a groundedness judge (`gpt-6.1-sol`) calibrated against hand labels with Cohen's kappa, a diagnosis table that blames each failure on retrieval or generation, a regression gate and a smoke test. The evals call the same functions the app does, so they measure what the product does.

The headline numbers need 40 hand labelled questions and 10 the docs cannot answer, and the labels are written by hand, not from the system's own output, because that would flatter it. Until that set exists, the README shows the retrieval and groundedness results as **Pending** rather than report a number no run file contains. What is measured so far: $0.036 across all 161 logged model calls, $0.0043 of it to embed the whole corpus.

## How it is built

- **Next.js 16** with the App Router, Cache Components and Turbopack, React 19 and strict TypeScript on Node.js 24. Tailwind CSS 4, with Geist Mono for the evidence text.
- **Vercel AI SDK 7** for streaming, structured output and embeddings, with `text-embedding-3-small` (1,536 dimensions). Zod 4 checks every boundary: requests, model output, eval files and run files.
- **Supabase Postgres** in its own project and a `citedesk` schema, with row level security and service role access only. Migrations and database functions are SQL and PL/pgSQL.
- **Chunking** counts tokens with `gpt-tokenizer` and builds anchors with `github-slugger`, so they match the live site. The corpus is the Supabase docs (Apache 2.0), pinned to commit `aa9d04e`.
- **Observability** with Langfuse Cloud and OpenTelemetry.
- **Vitest** (253 tests, no network), ESLint and `tsc`. GitHub Actions runs the free checks on every push, plus the eval gate.

## Built with Claude Code

Claude Code built it in a prompt, approve and implement loop, one branch per task, with each phase's prompt kept in the repo's `prompts/` folder. The Supabase MCP server applied migrations and the Langfuse MCP server inspected traces. Firecrawl researched similar products and read the docs. Headless Chrome ran the browser checks, and the README's Mermaid diagrams were rendered to check them. The hero image on the landing page was made with Higgsfield.
