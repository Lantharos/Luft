export interface Finding {
	line: number;
	text: string;
}

const PROSE = /^[A-Z][\p{Ll}’']+(?:[ ,][^\s]+)+[.!?…:]?$|^[A-Z][\p{Ll}’']+[.!?…]$/u;
const UI_KEY = /\b(?:title|label|text|subtitle|description|placeholder|accessible_name|accessibleName|tooltip|message|body|heading|missing|hint)\s*[:=]\s*(['"`])([A-Z][^'"`\n]*)\1/g;
const LITERAL = /(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g;
const LOGGING = /\b(?:console\.\w+|log|logError|debug|info|warn|error|trace|eprintln!|println!|panic!|unreachable!|expect|assert\w*!?|throw new Error|new Error|import|from|describe|it)\s*\(|^\s*(?:import|export \* from|\/\/|\*|#\[)/;
const SVELTE_ATTRIBUTE = /\s(?:title|label|description|placeholder|aria-label|alt|subtitle|text|heading|missing|hint|confirm|cancel)="([^"{]*\p{L}[^"{]*)"/gu;

const lineAt = (content: string, index: number) => content.slice(0, index).split('\n').length;
const blank = (text: string) => text.replace(/[^\n]/g, ' ');
const withoutExpressions = (text: string) => text.replace(/\$\{[^}]*\}/g, 'X');

function withoutMarkupExpressions(text: string): string {
	let previous = '';
	while (previous !== text) {
		previous = text;
		text = text.replace(/\{[^{}]*\}/g, blank);
	}
	return text;
}

function scriptStrings(content: string, offset = 0, all = content): Finding[] {
	const found: Finding[] = [];
	const lines = content.split('\n');
	let index = 0;
	for (const line of lines) {
		if (!LOGGING.test(line)) {
			const code = line.replace(/\s\/\/.*$/, '');
			for (const match of code.matchAll(LITERAL)) {
				const text = withoutExpressions(match[2]);
				if (PROSE.test(text)) found.push({ line: lineAt(all, offset + index + match.index), text: match[2] });
			}
			for (const match of code.matchAll(UI_KEY)) {
				if (!PROSE.test(withoutExpressions(match[2]))) found.push({ line: lineAt(all, offset + index + match.index), text: match[2] });
			}
		}
		index += line.length + 1;
	}
	return found;
}

function rustStrings(content: string): Finding[] {
	const tests = content.indexOf('#[cfg(test)]');
	return scriptStrings(tests >= 0 ? content.slice(0, tests) : content).filter(({ text }) => !text.includes('\\n'));
}

function svelteStrings(content: string): Finding[] {
	const found: Finding[] = [];
	for (const match of content.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
		found.push(...scriptStrings(match[1], match.index + match[0].indexOf(match[1]), content));
	}
	const markup = withoutMarkupExpressions(content.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, blank));
	for (const match of markup.matchAll(/>([^<>]*\p{L}[^<>]*)</gu)) {
		const text = match[1].trim();
		if (text) found.push({ line: lineAt(content, match.index), text });
	}
	for (const match of markup.matchAll(SVELTE_ATTRIBUTE)) found.push({ line: lineAt(content, match.index), text: match[1] });
	return found;
}

export function hardCoded(file: string, content: string): Finding[] {
	if (file.endsWith('.d.ts')) return [];
	if (file.endsWith('.svelte')) return svelteStrings(content);
	if (file.endsWith('.rs')) return rustStrings(content);
	return scriptStrings(content);
}
