import { highlightCode } from '@lezer/highlight';
import { codeHighlighter } from './highlighter';
import { loadLanguage } from './languages';

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

function escape(text: string) {
	return text.replace(/[&<>]/g, (character) => ENTITIES[character]);
}

export async function highlight(code: string, nameOrPath: string): Promise<string> {
	const support = await loadLanguage(nameOrPath);
	if (!support) return escape(code);
	let html = '';
	highlightCode(
		code,
		support.language.parser.parse(code),
		codeHighlighter,
		(text, classes) => (html += classes ? `<span class="${classes}">${escape(text)}</span>` : escape(text)),
		() => (html += '\n')
	);
	return html;
}
