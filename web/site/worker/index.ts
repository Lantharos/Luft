import { connectivity } from './connectivity';
import { download } from './downloads';
import { home } from './language';
import { rates } from './rates';
import { weather } from './weather';

export default {
	async fetch(request, env, context) {
		const url = new URL(request.url);
		switch (url.pathname) {
			case '/':
				return home(request, env.ASSETS);
			case '/connectivity':
				return connectivity();
			case '/api/weather':
				return weather(url, context);
			case '/api/rates':
				return rates(url, context);
		}
		return (await download(url.pathname)) ?? env.ASSETS.fetch(request);
	}
} satisfies ExportedHandler<Env>;
