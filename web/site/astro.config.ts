import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { urls } from '@luft/web';

export default defineConfig({
	site: urls.site,
	trailingSlash: 'never',
	build: { format: 'file', inlineStylesheets: 'always' },
	prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
	devToolbar: { enabled: false },
	vite: { plugins: [tailwindcss()] }
});
