// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://californiaroad.data', // Placeholder URL for sitemap generation
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  },

  output: 'server',
  adapter: cloudflare(),
  prefetch: true
});
