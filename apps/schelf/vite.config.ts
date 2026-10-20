import { luftFonts, luftLocales, sabineTarget } from '@luft/ui/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [luftFonts(), luftLocales(), sabineTarget(), tailwindcss(), svelte()],
	clearScreen: false,
	server: {
		port: 5179,
		strictPort: true,
		proxy: {
			'/flathub': {
				target: 'https://flathub.org',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/flathub/, '/api/v2')
			}
		},
		watch: {
			ignored: ['**/desktop/**']
		}
	}
});
