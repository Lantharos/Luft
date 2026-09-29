import { LanguageSupport, StreamLanguage, type StringStream } from '@codemirror/language';

const TIMESTAMP = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?|^\d{2}:\d{2}:\d{2}(?:[.,]\d+)?/;
const LEVELS: [RegExp, string][] = [
	[/^(?:FATAL|CRITICAL|ERROR|ERR|PANIC)\b/i, 'invalid'],
	[/^(?:WARNING|WARN)\b/i, 'changed'],
	[/^(?:INFO|NOTICE)\b/i, 'keyword'],
	[/^(?:DEBUG|TRACE|VERBOSE)\b/i, 'comment']
];

function token(stream: StringStream) {
	if (stream.eatSpace()) return null;
	if (stream.sol() || /\s/.test(stream.string.charAt(stream.pos - 1))) {
		if (stream.match(TIMESTAMP)) return 'meta';
		for (const [pattern, style] of LEVELS) if (stream.match(pattern)) return style;
	}
	if (stream.match(/^"(?:[^"\\]|\\.)*"?/)) return 'string';
	if (stream.match(/^https?:\/\/\S+/)) return 'link';
	if (stream.match(/^\d+(?:\.\d+)?(?:ms|s|b|kb|mb|%)?\b/i)) return 'number';
	stream.next();
	stream.eatWhile(/[^\s"\d]/);
	return null;
}

export const log = new LanguageSupport(StreamLanguage.define({ name: 'log', token }));
