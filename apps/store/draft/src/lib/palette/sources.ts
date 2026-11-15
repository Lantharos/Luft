import { t } from '@luft/i18n';
import { basename, fuzzyMatch, matchItems, type PaletteItem, type PaletteSource, parent, topMatches } from '@luft/ui';
import type { App } from '#lib/app/app.svelte.js';
import type { Command } from '#lib/commands/registry.js';
import { shortcutLabel } from '#lib/commands/keys.js';
import { openPath } from '#lib/documents/opening.js';
import { tildify } from '#lib/utils/paths.js';

const LIMIT = 80;
const COMMAND_PREFIX = '>';
const LINE_PREFIX = ':';

function split(indices: number[], nameStart: number) {
	return {
		labelMatches: indices.filter((index) => index >= nameStart).map((index) => index - nameStart),
		detailMatches: indices.filter((index) => index < nameStart)
	};
}

function fileItems(app: App, query: string): PaletteItem[] {
	const { workspace, files } = app;
	const open = (path: string) => () => void openPath(workspace, path);
	if (!query) {
		const documents = workspace.documents.filter((document) => document !== workspace.active && document.path);
		return documents.map((document) => ({
			key: document.id,
			label: document.name,
			detail: tildify(parent(document.path!), workspace.home),
			run: open(document.path!)
		}));
	}
	const lowered = query.toLowerCase().replaceAll(' ', '');
	const scores = new Map<string, number[]>();
	const matches = topMatches(files.files, LIMIT, (file) => {
		const match = fuzzyMatch(lowered, file.relative, file.lowered);
		if (!match) return null;
		scores.set(file.path, match.indices);
		const inName = match.indices[0] >= file.nameStart ? 12 : 0;
		return match.score + inName;
	});
	return matches.map((file) => ({
		key: file.path,
		label: basename(file.relative),
		detail: file.nameStart ? file.relative.slice(0, file.nameStart - 1) : '',
		run: open(file.path),
		...split(scores.get(file.path) ?? [], file.nameStart)
	}));
}

function lineItems(app: App, query: string): PaletteItem[] {
	const document = app.workspace.active;
	if (!document) return [];
	const lines = app.workspace.editor.state(document).doc.lines;
	const [line, column] = query.split(/[:,]/).map((part) => Number.parseInt(part, 10));
	if (!Number.isFinite(line)) return [{ key: 'line', label: t('draft-line-prompt', { lines }), run: () => {} }];
	const target = Math.min(Math.max(line, 1), lines);
	return [
		{
			key: 'line',
			label: Number.isFinite(column) ? t('draft-line-go-column', { line: String(target), column: String(column) }) : t('draft-line-go', { line: String(target) }),
			detail: t('draft-line-of', { lines }),
			run: () => app.workspace.editor.goTo(target, Number.isFinite(column) ? column : 1)
		}
	];
}

function shortcutOf(command: Command) {
	const keys = command.keys?.[0] ?? command.editorKeys;
	return keys && shortcutLabel(keys);
}

function commandItems(commands: Command[], query: string): PaletteItem[] {
	const lowered = query.trim().toLowerCase();
	const available = commands.filter((command) => command.available?.() ?? true);
	const matched = new Map<string, number[]>();
	const found = lowered
		? topMatches(available, LIMIT, (command) => {
				const match = fuzzyMatch(lowered, command.title());
				if (!match) return null;
				matched.set(command.id, match.indices);
				return match.score;
			})
		: available;
	return found.map((command) => ({
		key: command.id,
		label: command.title(),
		hint: shortcutOf(command),
		labelMatches: matched.get(command.id),
		run: command.run
	}));
}

export function quickOpen(app: App): PaletteSource {
	return {
		placeholder: t('draft-palette-placeholder'),
		empty: t('draft-palette-empty'),
		items: (query) => {
			if (query.startsWith(COMMAND_PREFIX)) return commandItems(app.commands, query.slice(COMMAND_PREFIX.length));
			if (query.startsWith(LINE_PREFIX)) return lineItems(app, query.slice(LINE_PREFIX.length));
			return fileItems(app, query.trim());
		}
	};
}

export function picker(placeholder: string, options: PaletteItem[]): PaletteSource {
	return {
		placeholder,
		empty: t('draft-palette-nothing'),
		items: (query) => matchItems(options, query)
	};
}
