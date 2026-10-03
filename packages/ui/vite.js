import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FONTS = fileURLToPath(new URL('./fonts/', import.meta.url));
const FONT_FILES = readdirSync(FONTS);
const SABINE_CHROMIUM = 'chrome151';

/** @returns {import('vite').Plugin} */
export function sabineTarget() {
	return {
		name: 'sabine-target',
		config: () => ({ build: { target: SABINE_CHROMIUM, cssTarget: SABINE_CHROMIUM } })
	};
}

/** @returns {import('vite').Plugin} */
export function luftFonts() {
	return {
		name: 'luft-fonts',
		config: () => ({ build: { rolldownOptions: { external: [/^\/fonts\//] } } }),
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
