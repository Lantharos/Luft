import { shared } from './shared';

const SOURCES = [
	(day: string) => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${day}/v1/currencies/eur.min.json`,
	(day: string) => `https://${day}.currency-api.pages.dev/v1/currencies/eur.min.json`
];
const CODE = /^[a-z]{3}$/;
const LOWEST_RATE = 1e-6;
const HIGHEST_RATE = 1e9;
const DAY_MS = 24 * 60 * 60 * 1000;
const SHARED_SECONDS = 60 * 60;

const dayBefore = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);

async function table(address: string) {
	const response = await fetch(address);
	if (!response.ok) return null;
	const { eur }: { eur: Record<string, unknown> } = await response.json();
	const rates = Object.entries(eur).filter(([code, rate]) => CODE.test(code) && typeof rate === 'number' && rate >= LOWEST_RATE && rate <= HIGHEST_RATE);
	return rates.length ? { eur: Object.fromEntries(rates) } : null;
}

async function newest() {
	for (const day of [dayBefore(0), dayBefore(1)]) {
		for (const source of SOURCES) {
			const found = await table(source(day)).catch(() => null);
			if (found) return found;
		}
	}
	return null;
}

export function rates(url: URL, context: ExecutionContext) {
	return shared(`${url.origin}/api/rates`, SHARED_SECONDS, context, newest);
}
