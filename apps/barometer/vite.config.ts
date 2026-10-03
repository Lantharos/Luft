import { luftFonts, sabineTarget } from '@luft/ui/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [luftFonts(), sabineTarget(), tailwindcss(), svelte()],
	clearScreen: false,
	server: {
		port: 5178,
		strictPort: true,
		watch: {
			ignored: ['**/desktop/**']
		}
	}
});
