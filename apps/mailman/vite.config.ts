import { luftFonts } from '@luft/ui/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [luftFonts(), tailwindcss(), sveltekit()],
	clearScreen: false,
	server: {
		port: 5183,
		strictPort: true,
		watch: {
			ignored: ['**/desktop/**']
		}
	}
});
