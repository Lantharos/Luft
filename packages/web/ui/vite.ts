import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

export { luftLocales } from '@luft/i18n/vite';

const FONTS = fileURLToPath(new URL('./fonts/', import.meta.url));
const FONT_FILES = readdirSync(FONTS);
const SABINE_CHROMIUM = 'chrome151';
const TEXT_PROPERTIES = new Set(['font-size', 'line-height']);
const FIXED_LENGTH = /^-?[\d.]+(px|rem)$/;

const scaleText = {
	postcssPlugin: 'luft-text-scale',
	Declaration(declaration: { prop: string; value: string }) {
		if (TEXT_PROPERTIES.has(declaration.prop) && FIXED_LENGTH.test(declaration.value)) {
			declaration.value = `calc(${declaration.value} * var(--text-scale, 1))`;
		}
	}
};

export function sabineTarget(): Plugin {
	return {
		name: 'sabine-target',
		config: () => ({ build: { target: SABINE_CHROMIUM, cssTarget: SABINE_CHROMIUM } })
	};
}

export function luftFonts(): Plugin {
	return {
		name: 'luft-fonts',
		config: () => ({
			build: { rolldownOptions: { external: [/^\/fonts\//] } },
			css: { postcss: { plugins: [scaleText] } }
		}),
		configureServer(server) {
			server.middlewares.use('/fonts', (request, response, next) => {
				const name = decodeURIComponent(request.url?.split('?')[0].slice(1) ?? '');
				if (!FONT_FILES.includes(name)) return next();
				response.setHeader('Content-Type', name.endsWith('.woff2') ? 'font/woff2' : 'text/plain');
				response.end(readFileSync(FONTS + name));
			});
		},
		generateBundle() {
			if (this.environment.config.consumer !== 'client') return;
			for (const name of FONT_FILES) {
				this.emitFile({ type: 'asset', fileName: `fonts/${name}`, source: readFileSync(FONTS + name) });
			}
		}
	};
}
