import { luftFonts, sabineTarget } from '@luft/ui/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { pdfjsAssets } from './vite/pdfjs.ts';
import { preview } from './vite/preview.ts';

export default defineConfig({
	plugins: [luftFonts(), sabineTarget(), pdfjsAssets(), preview(), tailwindcss(), svelte()],
	clearScreen: false,
	server: {
		port: 5177,
		strictPort: true,
		watch: {
			ignored: ['**/desktop/**']
		}
	}
});
