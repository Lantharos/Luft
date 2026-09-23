import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	clearScreen: false,
	build: {
		rolldownOptions: {
			transform: {
				define: {
					'import.meta': '{}'
				}
			}
		}
	},
	server: {
		port: 5173,
		strictPort: true,
		watch: {
			ignored: ['**/desktop/**']
		}
	}
});
