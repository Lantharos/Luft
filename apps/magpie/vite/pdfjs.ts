import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';

const FOLDERS = ['cmaps', 'standard_fonts', 'wasm', 'iccs'];
const ROOT = dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json'));
const TYPES: Record<string, string> = {
	'.wasm': 'application/wasm',
	'.js': 'text/javascript',
	'.mjs': 'text/javascript'
};

function files(folder: string): string[] {
	return readdirSync(join(ROOT, folder)).filter((name) => statSync(join(ROOT, folder, name)).isFile());
}

export function pdfjsAssets(): Plugin {
	return {
		name: 'magpie-pdfjs-assets',
		configureServer(server) {
			server.middlewares.use('/pdfjs', (request, response, next) => {
				const [folder, name] = decodeURIComponent(request.url?.split('?')[0].slice(1) ?? '').split('/');
				if (!FOLDERS.includes(folder) || !files(folder).includes(name)) return next();
				const extension = name.slice(name.lastIndexOf('.'));
				response.setHeader('Content-Type', TYPES[extension] ?? 'application/octet-stream');
				response.end(readFileSync(join(ROOT, folder, name)));
			});
		},
		generateBundle() {
			if (this.environment.config.consumer !== 'client') return;
			for (const folder of FOLDERS) {
				for (const name of files(folder)) {
					this.emitFile({ type: 'asset', fileName: `pdfjs/${folder}/${name}`, source: readFileSync(join(ROOT, folder, name)) });
				}
			}
		}
	};
}
