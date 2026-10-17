import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import starlightLinksValidator from 'starlight-links-validator';
import { urls } from '@luft/web';
import { sidebar } from './src/sidebar';

export default defineConfig({
	site: urls.docs,
	trailingSlash: 'always',
	prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
	vite: { plugins: [tailwindcss()] },
	integrations: [
		starlight({
			title: 'Luft Docs',
			description: 'How Luft works: installing it, the desktop, the apps, updates, security and building it yourself.',
			favicon: '/favicon.svg',
			customCss: ['./src/styles/global.css'],
			editLink: { baseUrl: `${urls.source}/edit/main/web/docs/` },
			lastUpdated: true,
			sidebar,
			components: {
				Head: './src/components/starlight/Head.astro',
				Header: './src/components/starlight/Header.astro',
				SiteTitle: './src/components/starlight/SiteTitle.astro',
				ThemeSelect: './src/components/starlight/ThemeSelect.astro',
				MobileMenuFooter: './src/components/starlight/MobileMenuFooter.astro'
			},
			expressiveCode: {
				themes: ['github-dark-default', 'github-light-default'],
				useStarlightDarkModeSwitch: true,
				styleOverrides: {
					borderRadius: '14px',
					borderColor: 'var(--hairline)',
					codeFontFamily: 'var(--font-mono)',
					uiFontFamily: 'var(--font-sans)',
					codeBackground: 'var(--well)',
					frames: {
						editorTabBarBackground: 'var(--well)',
						editorActiveTabBackground: 'var(--well)',
						terminalTitlebarBackground: 'var(--well)',
						terminalBackground: 'var(--well)',
						frameBoxShadowCssValue: 'none'
					}
				}
			},
			plugins: [starlightLinksValidator({ errorOnLocalLinks: false })]
		})
	]
});
