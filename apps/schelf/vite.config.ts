import { luftFonts } from '@luft/ui/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [luftFonts(), tailwindcss(), sveltekit()],
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
