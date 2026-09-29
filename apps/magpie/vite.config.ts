import { luftFonts } from '@luft/ui/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { pdfjsAssets } from './vite/pdfjs.ts';
import { preview } from './vite/preview.ts';

export default defineConfig({
	plugins: [luftFonts(), pdfjsAssets(), preview(), tailwindcss(), sveltekit()],
	clearScreen: false,
	server: {
		port: 5177,
		strictPort: true,
		watch: {
			ignored: ['**/desktop/**']
		}
	}
});
