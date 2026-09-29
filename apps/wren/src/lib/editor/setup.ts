import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, codeFolding, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState, type Extension } from '@codemirror/state';
import {
	crosshairCursor,
	drawSelection,
	dropCursor,
	EditorView,
	highlightActiveLine,
	highlightActiveLineGutter,
	highlightSpecialChars,
	keymap,
	lineNumbers,
	rectangularSelection
} from '@codemirror/view';
import { codeHighlighter } from '@luft/ui/code';
import { searchExtension } from './search/panel';
import { theme } from './theme';

const REPLACED_KEYS = new Set(['Mod-f', 'Mod-g', 'Mod-Alt-g']);

export const baseExtensions: Extension = [
	lineNumbers(),
	highlightActiveLineGutter(),
	codeFolding(),
	foldGutter({ openText: '⌄', closedText: '›' }),
	highlightSpecialChars(),
	history(),
	drawSelection(),
	dropCursor(),
	EditorState.allowMultipleSelections.of(true),
	indentOnInput(),
	syntaxHighlighting(codeHighlighter),
	bracketMatching(),
	closeBrackets(),
	rectangularSelection(),
	crosshairCursor(),
	highlightActiveLine(),
	highlightSelectionMatches(),
	searchExtension,
	keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap.filter((binding) => !REPLACED_KEYS.has(binding.key ?? '')), ...historyKeymap, ...foldKeymap, indentWithTab]),
	EditorView.contentAttributes.of({ spellcheck: 'false', autocapitalize: 'off', autocorrect: 'off' }),
	theme
];
