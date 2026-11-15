import { t } from '@luft/i18n';
import { matchItems, type PaletteSource } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import { composer } from '#lib/compose/composer.svelte.js';
import * as actions from '#lib/mail/actions.js';
import { list } from '#lib/mail/list.svelte.js';
import { mail } from '#lib/mail/mail.svelte.js';
import { BUNDLES, PRIMARY } from '#lib/mail/views.js';
import { reader } from '#lib/reader/reader.svelte.js';
import { keyNames } from './keys';
import { layout } from './layout.svelte';
import { navigate, openThread } from './navigation';

export interface Command {
	id: string;
	title: string;
	keys?: string;
	run: () => void;
}

export interface Shell {
	focusSearch: () => void;
	openSettings: () => void;
	addAccount: () => void;
	later: () => void;
	showShortcuts: () => void;
}

function targets() {
	if (list.chosen.size) return list.targets();
	const thread = reader.thread ?? list.selected;
	return thread === null ? [] : [thread];
}

function onThreads(run: (threads: number[]) => void) {
	return () => {
		const threads = targets();
		if (threads.length) run(threads);
	};
}

async function opened() {
	if (reader.thread === null && list.selected !== null) await reader.open(list.selected);
	const latest = reader.latest;
	return latest ? { latest, rendered: await reader.body(latest.id) } : null;
}

function replyTo(all: boolean) {
	return () =>
		void opened().then((found) => {
			if (found) composer.reply(found.latest, found.rendered, all);
		});
}

export function shellCommands(shell: Shell): Command[] {
	const views = [...PRIMARY, ...BUNDLES]
		.filter((view) => view.id !== 'screener' || mail.settings.screener)
		.map((view) => ({
			id: `go-${view.id}`,
			title: t('mailman-command-go', { folder: view.label() }),
			keys: view.key ? `G ${view.key.toUpperCase()}` : undefined,
			run: () => navigate(view.id)
		}));
	const folders = mail.mailboxes
		.filter((mailbox) => mailbox.selectable && !mailbox.role)
		.map((mailbox) => ({ id: `go-mailbox:${mailbox.id}`, title: t('mailman-command-go', { folder: mailbox.name }), run: () => navigate(`mailbox:${mailbox.id}`) }));
	const moves = mail.mailboxes
		.filter((mailbox) => mailbox.selectable && !mailbox.role)
		.map((mailbox) => ({ id: `move-${mailbox.id}`, title: t('mailman-command-move', { folder: mailbox.name }), run: onThreads((threads) => actions.moveTo(mailbox.id, threads)) }));
	const starred = (threads: number[]) => threads.every((thread) => list.rows.find((row) => row.thread === thread)?.flagged);
	return [
		{ id: 'compose', title: t('mailman-command-compose'), keys: 'C', run: () => composer.start() },
		{ id: 'search', title: t('mailman-command-search'), keys: '/', run: shell.focusSearch },
		{ id: 'archive', title: t('mailman-command-archive'), keys: 'E', run: onThreads((threads) => actions.move('archive', threads)) },
		{ id: 'trash', title: t('mailman-command-delete'), keys: '#', run: onThreads((threads) => actions.move(list.view === 'trash' ? 'deleteForever' : 'trash', threads)) },
		{ id: 'later', title: t('mailman-command-later'), keys: 'B', run: shell.later },
		{ id: 'star', title: t('mailman-command-star'), keys: 'S', run: onThreads((threads) => void actions.setStar(threads, !starred(threads))) },
		{ id: 'unread', title: t('mailman-command-unread'), keys: 'Shift U', run: onThreads((threads) => void actions.setRead(threads, false)) },
		{ id: 'read', title: t('mailman-command-read'), keys: 'Shift I', run: onThreads((threads) => void actions.setRead(threads, true)) },
		{ id: 'reply', title: t('mailman-command-reply'), keys: 'R', run: replyTo(false) },
		{ id: 'reply-all', title: t('mailman-command-reply-all'), keys: 'A', run: replyTo(true) },
		{ id: 'forward', title: t('mailman-command-forward'), keys: 'F', run: () => void opened().then((found) => found && composer.forward(found.latest, found.rendered)) },
		{ id: 'junk', title: t('mailman-command-junk'), keys: '!', run: onThreads((threads) => actions.move('spam', threads)) },
		{ id: 'inbox', title: t('mailman-command-inbox'), keys: 'Shift V', run: onThreads((threads) => actions.move('inbox', threads)) },
		{ id: 'choose', title: t('mailman-command-choose'), keys: 'X', run: () => list.selected !== null && list.choose(list.selected) },
		{ id: 'choose-all', title: t('mailman-command-choose-all'), run: () => list.rows.forEach((row) => list.chosen.add(row.thread)) },
		{ id: 'next', title: t('mailman-command-next'), keys: 'J', run: () => step(1) },
		{ id: 'previous', title: t('mailman-command-previous'), keys: 'K', run: () => step(-1) },
		{ id: 'open', title: t('mailman-command-open'), keys: 'Enter', run: open },
		{ id: 'close', title: t('mailman-command-close'), keys: 'Esc', run: () => (list.chosen.size ? list.chosen.clear() : reader.close()) },
		{ id: 'expand', title: t('mailman-command-expand'), keys: ';', run: () => reader.expandAll() },
		...views,
		...folders,
		...moves,
		{ id: 'sync', title: t('mailman-command-sync'), keys: 'F5', run: mail.checkNow },
		{ id: 'settings', title: t('mailman-command-settings'), keys: 'Ctrl ,', run: shell.openSettings },
		{ id: 'add-account', title: t('mailman-command-add-account'), run: shell.addAccount },
		{ id: 'toggle-screener', title: mail.settings.screener ? t('mailman-command-screener-off') : t('mailman-command-screener-on'), run: () => void mail.updateSettings({ screener: !mail.settings.screener }).then(list.load) },
		{ id: 'toggle-bundles', title: mail.settings.bundles ? t('mailman-command-bundles-off') : t('mailman-command-bundles-on'), run: () => void mail.updateSettings({ bundles: !mail.settings.bundles }).then(list.load) },
		{ id: 'shortcuts', title: t('mailman-command-shortcuts'), keys: '?', run: shell.showShortcuts },
		{ id: 'quit', title: t('mailman-command-quit'), keys: 'Ctrl Q', run: () => void commands.quit() }
	];
}

export function paletteSource(shell: Shell, search: (query: string) => void): PaletteSource {
	return {
		placeholder: list.searching ? t('mailman-palette-commands') : t('mailman-palette-commands-search'),
		items: (query) => {
			const matches = matchItems(shellCommands(shell).map(({ id, title, keys, run }) => ({ key: id, label: title, hint: keys && keyNames(keys), run })), query);
			const trimmed = query.trim();
			return trimmed ? [...matches, { key: 'search-for', label: t('mailman-palette-search', { query: trimmed }), hint: keyNames('Enter'), run: () => search(trimmed) }] : matches;
		}
	};
}

function open() {
	const row = list.current;
	if (!row) return;
	if (row.draft && list.view === 'drafts') void composer.reopen(row.id);
	else void openThread(row.thread);
}

export function step(offset: number) {
	const row = list.step(offset);
	if (row && (reader.thread !== null || layout.sideBySide)) void openThread(row.thread);
}
