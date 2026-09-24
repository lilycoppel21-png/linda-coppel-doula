// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Astro configuration.
// - `site` is the final public URL. Astro uses it to build the sitemap and any
//   absolute links. 👉 Replace the placeholder below once you have a real domain.
// - `base` is the folder the site is served from. It stays '/' for a real
//   domain; the preview deploy overrides both through the environment so
//   nothing here has to change when the site goes live.
// - Tailwind CSS v4 is wired in as a Vite plugin. The actual colors and fonts
//   live in src/styles/global.css.
export default defineConfig({
  site: process.env.PUBLIC_SITE ?? 'https://example.com',
  base: process.env.PUBLIC_BASE ?? '/',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});
