// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Absolute URLs for share cards, canonical links and language alternates.
  site: 'https://danielcolorado.dev',
  // Fonts come from Google Fonts at build time and are served from this site, subset to Latin.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  markdown: {
    // Warm dark theme for the code in case studies, close to the site's amber.
    shikiConfig: { theme: 'vesper' },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
