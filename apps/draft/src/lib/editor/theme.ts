import { EditorView } from '@codemirror/view';

export const theme = EditorView.theme({
	'&': {
		height: '100%',
		color: 'var(--text)',
		backgroundColor: 'var(--content)',
		fontSize: 'var(--editor-font-size)'
	},
	'&.cm-focused': {
		outline: 'none'
	},
	'.cm-scroller': {
		fontFamily: 'var(--font-mono)',
		lineHeight: '1.65',
		scrollbarWidth: 'thin',
		scrollbarColor: 'var(--editor-scrollbar) transparent'
	},
	'.cm-content': {
		padding: '10px 0 30vh',
		caretColor: 'var(--accent)',
		fontVariantLigatures: 'contextual'
	},
	'.cm-line': {
		padding: '0 24px 0 6px'
	},
	'.cm-cursor, .cm-dropCursor': {
		borderLeft: '2px solid var(--accent)',
		marginLeft: '-1px'
	},
	'.cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
		background: 'var(--editor-selection)'
	},
	'.cm-content ::selection': {
		background: 'transparent'
	},
	'.cm-activeLine': {
		backgroundColor: 'var(--editor-active-line)'
	},
	'.cm-gutters': {
		backgroundColor: 'var(--content)',
		color: 'var(--editor-gutter)',
		border: 'none',
		paddingLeft: '10px'
	},
	'.cm-lineNumbers .cm-gutterElement': {
		minWidth: '3ch',
		padding: '0 10px 0 4px',
		fontVariantNumeric: 'tabular-nums'
	},
	'.cm-activeLineGutter': {
		backgroundColor: 'transparent',
		color: 'var(--text-soft)'
	},
	'.cm-foldGutter .cm-gutterElement': {
		width: '14px',
		color: 'var(--text-muted)',
		opacity: '0',
		transition: 'opacity 140ms var(--ease)'
	},
	'.cm-gutters:hover .cm-foldGutter .cm-gutterElement': {
		opacity: '1'
	},
	'.cm-foldPlaceholder': {
		margin: '0 4px',
		padding: '0 6px',
		border: 'none',
		borderRadius: '6px',
		backgroundColor: 'var(--surface-hover)',
		color: 'var(--text-muted)'
	},
	'.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
		backgroundColor: 'var(--editor-bracket)',
		outline: '1px solid var(--editor-bracket-line)',
		borderRadius: '2px'
	},
	'.cm-nonmatchingBracket, &.cm-focused .cm-nonmatchingBracket': {
		color: 'var(--danger)',
		backgroundColor: 'transparent'
	},
	'.cm-selectionMatch': {
		backgroundColor: 'var(--editor-selection-match)'
	},
	'.cm-searchMatch': {
		backgroundColor: 'var(--editor-search-match)',
		borderRadius: '2px'
	},
	'.cm-searchMatch.cm-searchMatch-selected': {
		backgroundColor: 'var(--editor-search-current)',
		outline: '1px solid var(--accent-line)'
	},
	'.cm-panels': {
		backgroundColor: 'var(--content)',
		color: 'var(--text)'
	},
	'.cm-panels-top': {
		borderBottom: 'none'
	},
	'.cm-specialChar': {
		color: 'var(--danger)'
	},
	'.cm-tooltip': {
		border: 'none',
		borderRadius: '12px',
		backgroundColor: 'var(--popover)',
		boxShadow: '0 12px 40px var(--shadow-soft)'
	}
});
