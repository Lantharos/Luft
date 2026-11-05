import { findLanguage } from '@luft/ui/code';

const SHEBANGS: [RegExp, string][] = [
	[/\b(node|deno|bun)\b/, 'JavaScript'],
	[/\bpython[\d.]*\b/, 'Python'],
	[/\b(ba|z|da)?sh\b/, 'Shell'],
	[/\bruby\b/, 'Ruby'],
	[/\bperl\b/, 'Perl'],
	[/\blua\b/, 'Lua']
];

export function detectLanguage(path: string | null, firstLine: string) {
	const byPath = path && findLanguage(path);
	if (byPath) return byPath.name;
	if (!firstLine.startsWith('#!')) return null;
	return SHEBANGS.find(([pattern]) => pattern.test(firstLine))?.[1] ?? null;
}
