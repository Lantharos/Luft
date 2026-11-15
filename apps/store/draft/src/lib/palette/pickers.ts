import { t } from '@luft/i18n';
import { languages } from '@luft/ui/code';
import type { App } from '#lib/app/app.svelte.js';
import type { Document } from '#lib/documents/document.svelte.js';
import { ENCODINGS, encodingTitle, type LineEnding } from '#lib/documents/encodings.js';
import { reload } from '#lib/documents/opening.js';
import { save } from '#lib/documents/saving.js';
import { detectIndentation } from '#lib/editor/indentation.js';
import { picker } from './sources';

const WIDTHS = [2, 3, 4, 6, 8];

export function languagePicker(app: App, document: Document) {
	const choose = (language: string | null) => () => {
		document.language = language;
		void app.workspace.editor.applyLanguage(document);
	};
	return picker(t('draft-pick-language'), [
		{ key: 'plain', label: t('draft-plain-text'), checked: document.language === null, run: choose(null) },
		...languages.map((language) => ({
			key: language.name,
			label: language.name,
			detail: language.extensions
				.slice(0, 4)
				.map((extension) => `.${extension}`)
				.join(' '),
			checked: document.language === language.name,
			run: choose(language.name)
		}))
	]);
}

export function encodingPicker(app: App, document: Document) {
	const saveEncoded = async (label: string, bom: boolean) => {
		const { encoding, bom: marked } = document;
		document.encoding = label;
		document.bom = bom;
		if (await save(app.workspace, document)) return;
		document.encoding = encoding;
		document.bom = marked;
	};
	const reopenWith = (label: string) => () => void reload(app.workspace, document, label);
	return picker(t('draft-pick-encoding'), [
		...ENCODINGS.map((encoding) => ({
			key: `save-${encoding.label}`,
			label: t('draft-encoding-save', { encoding: encodingTitle(encoding) }),
			checked: document.encoding === encoding.label && !document.bom,
			run: () => void saveEncoded(encoding.label, false)
		})),
		{ key: 'save-utf-8-bom', label: t('draft-encoding-save-bom'), checked: document.encoding === 'utf-8' && document.bom, run: () => void saveEncoded('utf-8', true) },
		...(document.path && !document.dirty
			? ENCODINGS.map((encoding) => ({ key: `reopen-${encoding.label}`, label: t('draft-encoding-reopen', { encoding: encodingTitle(encoding) }), run: reopenWith(encoding.label) }))
			: [])
	]);
}

export function lineEndingPicker(app: App, document: Document) {
	const choose = (lineEnding: LineEnding) => () => {
		document.lineEnding = lineEnding;
		app.workspace.refreshDirty(document);
		app.workspace.changed();
	};
	return picker(t('draft-pick-line-endings'), [
		{ key: 'lf', label: 'LF', detail: t('draft-line-endings-lf'), checked: document.lineEnding === 'lf', run: choose('lf') },
		{ key: 'crlf', label: 'CRLF', detail: t('draft-line-endings-crlf'), checked: document.lineEnding === 'crlf', run: choose('crlf') }
	]);
}

export function indentationPicker(app: App, document: Document) {
	const { editor } = app.workspace;
	const apply = (tabs: boolean, width: number) => () => {
		document.indentation = { tabs, width };
		editor.applyIndentation(document);
	};
	const detect = () => {
		const { tabs, tabWidth } = app.settings.value;
		const text = editor.state(document).doc.sliceString(0, 200_000);
		document.indentation = detectIndentation(text, { tabs, width: tabWidth });
		editor.applyIndentation(document);
	};
	const { tabs, width } = document.indentation;
	return picker(t('draft-pick-indentation'), [
		...WIDTHS.map((size) => ({ key: `tabs-${size}`, label: t('draft-indentation-tabs', { width: size }), checked: tabs && width === size, run: apply(true, size) })),
		...WIDTHS.map((size) => ({ key: `spaces-${size}`, label: t('draft-indentation-spaces', { count: size }), checked: !tabs && width === size, run: apply(false, size) })),
		{ key: 'detect', label: t('draft-indentation-detect'), run: detect }
	]);
}

export function defaultIndentationPicker(app: App) {
	const { tabs, tabWidth } = app.settings.value;
	const choose = (useTabs: boolean, width: number) => () => app.settings.update({ tabs: useTabs, tabWidth: width });
	return picker(t('draft-pick-default-indentation'), [
		...WIDTHS.map((size) => ({ key: `tabs-${size}`, label: t('draft-indentation-tabs', { width: size }), checked: tabs && tabWidth === size, run: choose(true, size) })),
		...WIDTHS.map((size) => ({ key: `spaces-${size}`, label: t('draft-indentation-spaces', { count: size }), checked: !tabs && tabWidth === size, run: choose(false, size) }))
	]);
}
