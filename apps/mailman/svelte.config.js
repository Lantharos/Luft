import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		router: {
			type: 'hash'
		},
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'sabine:', 'data:', 'blob:'],
				'font-src': ['self', 'data:'],
				'media-src': ['self', 'sabine:'],
				'connect-src': ['self', 'sabine:'],
				'object-src': ['none'],
				'frame-src': ['none'],
				'base-uri': ['none'],
				'form-action': ['none']
			}
		}
	}
};

export default config;
