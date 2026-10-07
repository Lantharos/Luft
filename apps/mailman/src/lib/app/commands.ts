import { composer } from '#lib/compose/composer.svelte.js';
import * as actions from '#lib/mail/actions.js';
import { list } from '#lib/mail/list.svelte.js';
import { mail } from '#lib/mail/mail.svelte.js';
import { BUNDLES, PRIMARY } from '#lib/mail/views.js';
import { reader } from '#lib/reader/reader.svelte.js';
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

export function commands(shell: Shell): Command[] {
	const views = [...PRIMARY, ...BUNDLES].map((view) => ({
		id: `go-${view.id}`,
		title: `Go to ${view.label}`,
		keys: view.key ? `G ${view.key.toUpperCase()}` : undefined,
		run: () => navigate(view.id)
	}));
	const folders = mail.mailboxes
		.filter((mailbox) => mailbox.selectable && !mailbox.role)
		.map((mailbox) => ({ id: `go-mailbox:${mailbox.id}`, title: `Go to ${mailbox.name}`, run: () => navigate(`mailbox:${mailbox.id}`) }));
	const moves = mail.mailboxes
		.filter((mailbox) => mailbox.selectable && !mailbox.role)
		.map((mailbox) => ({ id: `move-${mailbox.id}`, title: `Move to ${mailbox.name}`, run: onThreads((threads) => actions.moveTo(mailbox.id, threads)) }));
	const starred = (threads: number[]) => threads.every((thread) => list.rows.find((row) => row.thread === thread)?.flagged);
	return [
		{ id: 'compose', title: 'Write a message', keys: 'C', run: () => composer.start() },
		{ id: 'search', title: 'Search mail', keys: '/', run: shell.focusSearch },
		{ id: 'archive', title: 'Archive', keys: 'E', run: onThreads((threads) => actions.move('archive', threads)) },
		{ id: 'trash', title: 'Delete', keys: '#', run: onThreads((threads) => actions.move(list.view === 'trash' ? 'deleteForever' : 'trash', threads)) },
		{ id: 'later', title: 'Later…', keys: 'B', run: shell.later },
		{ id: 'star', title: 'Star or unstar', keys: 'S', run: onThreads((threads) => void actions.setStar(threads, !starred(threads))) },
		{ id: 'unread', title: 'Mark as unread', keys: 'Shift U', run: onThreads((threads) => void actions.setRead(threads, false)) },
		{ id: 'read', title: 'Mark as read', keys: 'Shift I', run: onThreads((threads) => void actions.setRead(threads, true)) },
		{ id: 'reply', title: 'Reply', keys: 'R', run: replyTo(false) },
		{ id: 'reply-all', title: 'Reply all', keys: 'A', run: replyTo(true) },
		{ id: 'forward', title: 'Forward', keys: 'F', run: () => void opened().then((found) => found && composer.forward(found.latest, found.rendered)) },
		{ id: 'junk', title: 'Report junk', keys: '!', run: onThreads((threads) => actions.move('spam', threads)) },
		{ id: 'inbox', title: 'Move to Inbox', keys: 'Shift V', run: onThreads((threads) => actions.move('inbox', threads)) },
		{ id: 'choose', title: 'Select or unselect the conversation', keys: 'X', run: () => list.selected !== null && list.choose(list.selected) },
		{ id: 'choose-all', title: 'Select every conversation shown', run: () => list.rows.forEach((row) => list.chosen.add(row.thread)) },
		{ id: 'next', title: 'Next conversation', keys: 'J', run: () => step(1) },
		{ id: 'previous', title: 'Previous conversation', keys: 'K', run: () => step(-1) },
		{ id: 'open', title: 'Open conversation', keys: 'Enter', run: open },
		{ id: 'close', title: 'Back to the list', keys: 'Esc', run: () => (list.chosen.size ? list.chosen.clear() : reader.close()) },
		{ id: 'expand', title: 'Expand all messages', keys: ';', run: () => reader.expandAll() },
		...views,
		...folders,
		...moves,
		{ id: 'sync', title: 'Check for new mail', keys: 'F5', run: mail.checkNow },
		{ id: 'settings', title: 'Settings', keys: 'Ctrl ,', run: shell.openSettings },
		{ id: 'add-account', title: 'Add an account', run: shell.addAccount },
		{ id: 'toggle-screener', title: mail.settings.screener ? 'Turn off the Screener' : 'Turn on the Screener', run: () => void mail.updateSettings({ screener: !mail.settings.screener }).then(list.load) },
		{ id: 'toggle-bundles', title: mail.settings.bundles ? 'Show bundled mail in the inbox' : 'Bundle newsletters, receipts and updates', run: () => void mail.updateSettings({ bundles: !mail.settings.bundles }).then(list.load) },
		{ id: 'shortcuts', title: 'Keyboard shortcuts', keys: '?', run: shell.showShortcuts }
	];
}

function open() {
	const row = list.current;
	if (!row) return;
	if (row.draft && list.view === 'drafts') void composer.reopen(row.id);
	else void openThread(row.thread);
}

export function step(offset: number) {
	const row = list.step(offset);
	if (row && (reader.thread !== null || wide())) void openThread(row.thread);
}

export const WIDE_WINDOW = 1080;

function wide() {
	return window.innerWidth >= WIDE_WINDOW;
}
