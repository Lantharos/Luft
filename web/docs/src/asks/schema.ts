import { z } from 'astro/zod';

const phrase = z
	.string()
	.regex(/^[\p{Ll}\p{N}][\p{Ll}\p{N} '+./-]*[\p{Ll}\p{N}+]$/u, 'Write asks lowercase, the way people type them, without question marks');

const anchor = z.string().regex(/^[a-z0-9-]+$/, 'Point `to` at a heading anchor, without the #');

export const askSchema = z.union([
	phrase,
	z.strictObject({
		ask: phrase,
		to: anchor.optional(),
		shared: z.literal(true).optional()
	})
]);

export const asksSchema = z.array(askSchema).min(1);

export type Ask = z.infer<typeof askSchema>;

export interface ResolvedAsk {
	ask: string;
	to?: string;
	shared: boolean;
}

export const resolveAsks = (asks: Ask[]): ResolvedAsk[] =>
	asks.map((entry) => (typeof entry === 'string' ? { ask: entry, shared: false } : { ...entry, shared: entry.shared ?? false }));

export const userSections = ['start', 'desktop', 'windows', 'personalize', 'apps', 'files', 'system'];
