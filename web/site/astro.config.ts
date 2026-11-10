import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { urls } from '@luft/web';
import { routedLocales, sitemapLocales, SOURCE_LOCALE } from './src/i18n/locales';

const platform = readFileSync(new URL('./src/layouts/platform.js', import.meta.url));

export default defineConfig({
	site: urls.site,
	trailingSlash: 'never',
	build: { format: 'file', inlineStylesheets: 'always' },
	i18n: {
		locales: routedLocales,
		defaultLocale: SOURCE_LOCALE,
		routing: { prefixDefaultLocale: false }
	},
	integrations: [
		sitemap({
			i18n: { defaultLocale: SOURCE_LOCALE, locales: sitemapLocales },
			filter: (page) => !page.endsWith('/404')
		})
	],
	prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
	devToolbar: { enabled: false },
	security: {
		csp: {
			directives: ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"],
			scriptDirective: { hashes: [`sha256-${createHash('sha256').update(platform).digest('base64')}`] },
			styleDirective: { resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }] }
		}
	},
	vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined) } }
});
