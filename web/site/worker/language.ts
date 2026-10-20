import { LANGUAGES, negotiate, pathOf, SOURCE_LOCALE } from '../src/i18n/locales';

const COOKIE = 'lang';
const YEAR_SECONDS = 365 * 24 * 60 * 60;
const TAGS = new Set(LANGUAGES.map(({ tag }) => tag));

function remembered(request: Request) {
	const cookies = request.headers.get('cookie') ?? '';
	const value = cookies.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1];
	return value && TAGS.has(value) ? value : null;
}

function accepted(request: Request) {
	return (request.headers.get('accept-language') ?? '')
		.split(',')
		.map((part) => {
			const [tag, ...parameters] = part.trim().split(';');
			const quality = parameters.find((parameter) => parameter.trim().startsWith('q='));
			return { tag: tag.trim(), quality: quality ? Number(quality.trim().slice(2)) : 1 };
		})
		.filter(({ tag, quality }) => tag && tag !== '*' && quality > 0)
		.sort((a, b) => b.quality - a.quality)
		.map(({ tag }) => tag);
}

function preferred(request: Request) {
	const locale = negotiate(accepted(request));
	return TAGS.has(locale) ? locale : SOURCE_LOCALE;
}

async function page(request: Request, assets: Fetcher, locale: string) {
	if (locale !== SOURCE_LOCALE) return new Response(null, { status: 302, headers: { location: `/${pathOf(locale)}` } });
	const english = await assets.fetch(request);
	return new Response(english.body, english);
}

export async function home(request: Request, assets: Fetcher) {
	const chosen = remembered(request);
	const locale = chosen ?? preferred(request);
	const response = await page(request, assets, locale);
	response.headers.set('cache-control', 'private, no-cache');
	response.headers.append('vary', 'cookie, accept-language');
	if (!chosen) response.headers.append('set-cookie', `${COOKIE}=${locale}; Path=/; Max-Age=${YEAR_SECONDS}; SameSite=Lax; Secure`);
	return response;
}
