import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { urls } from '@luft/web';
import { routedLocales, sitemapLocales, SOURCE_LOCALE } from './src/i18n/locales';

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
	vite: { plugins: [tailwindcss()] }
});
