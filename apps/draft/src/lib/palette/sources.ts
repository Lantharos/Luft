import { basename } from '@luft/ui';
import type { App } from '#lib/app/app.svelte.js';
import type { Command } from '#lib/commands/registry.js';
import { openPath } from '#lib/documents/opening.js';
import { dirname, tildify } from '#lib/utils/paths.js';
import { fuzzyMatch, topMatches } from './fuzzy';
import type { PaletteItem, PaletteSource } from './palette.svelte';

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
			detail: tildify(dirname(document.path!), workspace.home),
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
	if (!Number.isFinite(line)) return [{ key: 'line', label: `Type a line number from 1 to ${lines.toLocaleString()}`, run: () => {} }];
	const target = Math.min(Math.max(line, 1), lines);
	return [
		{
			key: 'line',
			label: Number.isFinite(column) ? `Go to line ${target}, column ${column}` : `Go to line ${target}`,
			detail: `of ${lines.toLocaleString()}`,
			run: () => app.workspace.editor.goTo(target, Number.isFinite(column) ? column : 1)
		}
	];
}

function commandItems(commands: Command[], query: string): PaletteItem[] {
	const lowered = query.trim().toLowerCase();
	const available = commands.filter((command) => command.available?.() ?? true);
	const matched = new Map<string, number[]>();
	const found = lowered
		? topMatches(available, LIMIT, (command) => {
				const match = fuzzyMatch(lowered, command.title);
				if (!match) return null;
				matched.set(command.id, match.indices);
				return match.score;
			})
		: available;
	return found.map((command) => ({
		key: command.id,
		label: command.title,
		hint: command.keys?.[0],
		labelMatches: matched.get(command.id),
		run: command.run
	}));
}

export function quickOpen(app: App): PaletteSource {
	return {
		placeholder: 'Go to a file',
		empty: 'No matching files',
		items: (query) => {
			if (query.startsWith(COMMAND_PREFIX)) return commandItems(app.commands, query.slice(COMMAND_PREFIX.length));
			if (query.startsWith(LINE_PREFIX)) return lineItems(app, query.slice(LINE_PREFIX.length));
			return fileItems(app, query.trim());
		}
	};
}

export function picker(placeholder: string, options: { key: string; label: string; detail?: string; checked?: boolean; run: () => void }[]): PaletteSource {
	return {
		placeholder,
		empty: 'Nothing matches',
		items: (query) => {
			const lowered = query.trim().toLowerCase();
			if (!lowered) return options;
			const matched = new Map<string, number[]>();
			return topMatches(options, LIMIT, (option) => {
				const match = fuzzyMatch(lowered, option.label);
				if (match) matched.set(option.key, match.indices);
				return match?.score ?? null;
			}).map((option) => ({ ...option, labelMatches: matched.get(option.key) }));
		}
	};
}
