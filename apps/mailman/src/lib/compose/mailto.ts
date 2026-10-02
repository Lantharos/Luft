import type { Address } from '$lib/api';

export interface Mailto {
	to: Address[];
	cc: Address[];
	bcc: Address[];
	subject: string;
	body: string;
}

function addresses(value: string | null): Address[] {
	return (value ?? '')
		.split(',')
		.map((address) => decodeURIComponent(address).trim())
		.filter(Boolean)
		.map((address) => ({ name: '', address }));
}

export function parseMailto(url: string): Mailto {
	const rest = url.replace(/^mailto:/i, '');
	const [target, query = ''] = rest.split('?', 2);
	const parameters = new URLSearchParams(query);
	const lower = new Map([...parameters].map(([key, value]) => [key.toLowerCase(), value]));
	return {
		to: [...addresses(target), ...addresses(lower.get('to') ?? null)],
		cc: addresses(lower.get('cc') ?? null),
		bcc: addresses(lower.get('bcc') ?? null),
		subject: lower.get('subject') ?? '',
		body: lower.get('body') ?? ''
	};
}
