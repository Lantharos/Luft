import { luftFonts, luftLocales, sabineTarget } from '@luft/ui/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [luftFonts(), luftLocales(), sabineTarget(), tailwindcss(), svelte()],
	clearScreen: false,
	worker: { format: 'es' },
	server: {
		port: 5191,
		strictPort: true,
		watch: {
			ignored: ['**/desktop/**']
		}
	}
});
