import * as api from '$lib/api';
import { composer } from '$lib/compose/composer.svelte';
import * as actions from '$lib/mail/actions';
import { list } from '$lib/mail/list.svelte';
import { mail } from '$lib/mail/mail.svelte';
import { BUNDLES, PRIMARY } from '$lib/mail/views';
import { reader } from '$lib/reader/reader.svelte';
import { toasts } from '$lib/shell/toasts.svelte';
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

function target() {
	return reader.thread ?? list.selected;
}

function onThread(run: (thread: number) => void) {
	return () => {
		const thread = target();
		if (thread !== null) run(thread);
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
		.map((mailbox) => ({ id: `move-${mailbox.id}`, title: `Move to ${mailbox.name}`, run: onThread((thread) => actions.moveTo(mailbox.id, [thread])) }));
	const selectedRow = () => list.rows.find((row) => row.thread === target());
	return [
		{ id: 'compose', title: 'Write a message', keys: 'C', run: () => composer.start() },
		{ id: 'search', title: 'Search mail', keys: '/', run: shell.focusSearch },
		{ id: 'archive', title: 'Archive', keys: 'E', run: onThread((thread) => actions.move('archive', [thread])) },
		{ id: 'trash', title: 'Delete', keys: '#', run: onThread((thread) => actions.move(list.view === 'trash' ? 'deleteForever' : 'trash', [thread])) },
		{ id: 'later', title: 'Later…', keys: 'B', run: shell.later },
		{ id: 'star', title: 'Star or unstar', keys: 'S', run: onThread((thread) => void actions.setStar([thread], !selectedRow()?.flagged)) },
		{ id: 'unread', title: 'Mark as unread', keys: 'Shift U', run: onThread((thread) => void actions.setRead([thread], false)) },
		{ id: 'read', title: 'Mark as read', keys: 'Shift I', run: onThread((thread) => void actions.setRead([thread], true)) },
		{ id: 'reply', title: 'Reply', keys: 'R', run: replyTo(false) },
		{ id: 'reply-all', title: 'Reply all', keys: 'A', run: replyTo(true) },
		{ id: 'forward', title: 'Forward', keys: 'F', run: () => void opened().then((found) => found && composer.forward(found.latest, found.rendered)) },
		{ id: 'junk', title: 'Report junk', keys: '!', run: onThread((thread) => actions.move('spam', [thread])) },
		{ id: 'inbox', title: 'Move to Inbox', keys: 'Shift V', run: onThread((thread) => actions.move('inbox', [thread])) },
		{ id: 'next', title: 'Next conversation', keys: 'J', run: () => step(1) },
		{ id: 'previous', title: 'Previous conversation', keys: 'K', run: () => step(-1) },
		{ id: 'open', title: 'Open conversation', keys: 'Enter', run: open },
		{ id: 'close', title: 'Back to the list', keys: 'Esc', run: () => reader.close() },
		{ id: 'expand', title: 'Expand all messages', keys: ';', run: () => reader.expandAll() },
		...views,
		...folders,
		...moves,
		{ id: 'sync', title: 'Check for new mail', keys: 'Shift R', run: () => void api.syncNow().then(() => toasts.show('Checking for mail')) },
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
