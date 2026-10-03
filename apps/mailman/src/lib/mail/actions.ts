import * as api from '#lib/api/index.js';
import type { Action } from '#lib/api/index.js';
import { until } from '#lib/app/format.js';
import { reader } from '#lib/reader/reader.svelte.js';
import { toasts } from '#lib/shell/toasts.svelte.js';
import { list } from './list.svelte';
import { mail } from './mail.svelte';

type Mover = 'archive' | 'trash' | 'spam' | 'inbox' | 'deleteForever';

const MOVED: Record<Mover, (count: number) => string> = {
	archive: (count) => (count === 1 ? 'Archived' : `Archived ${count} conversations`),
	trash: (count) => (count === 1 ? 'Moved to Trash' : `Moved ${count} conversations to Trash`),
	spam: (count) => (count === 1 ? 'Marked as junk' : `Marked ${count} conversations as junk`),
	inbox: (count) => (count === 1 ? 'Moved to Inbox' : `Moved ${count} conversations to Inbox`),
	deleteForever: (count) => (count === 1 ? 'Deleted forever' : `Deleted ${count} conversations forever`)
};

const STAYS: Partial<Record<Mover, string>> = { archive: 'archive', trash: 'trash', spam: 'junk', inbox: 'inbox' };

function settle() {
	if (reader.thread !== null && reader.thread !== list.selected) void reader.open(list.selected);
	void mail.refresh();
}

function leave(threads: number[]) {
	list.remove(threads);
	settle();
}

async function undoable(action: Action, threads: number[], message: string) {
	try {
		const undo = await api.act(action, { threads });
		toasts.show(message, {
			action: undo.moves.length
				? { label: 'Undo', run: () => void restore(undo.moves) }
				: action.action === 'snooze'
					? { label: 'Undo', run: () => void api.act({ action: 'unsnooze' }, { threads }).then(refreshAll) }
					: undefined
		});
	} catch (error) {
		toasts.fail(error);
		await refreshAll();
	}
}

async function restore(moves: { id: number; mailbox: number }[]) {
	await api.act({ action: 'restore', moves }, { ids: moves.map((move) => move.id) });
	await refreshAll();
}

export async function refreshAll() {
	await mail.refresh();
	await Promise.all([list.load(), reader.refresh()]);
}

export function move(kind: Mover, threads: number[], message = MOVED[kind](threads.length)) {
	if (!threads.length) return;
	if (STAYS[kind] !== list.view) leave(threads);
	void undoable({ action: kind }, threads, message);
}

export function moveTo(mailbox: number, threads: number[]) {
	if (!threads.length) return;
	const name = mail.mailboxes.find((candidate) => candidate.id === mailbox)?.name ?? 'folder';
	if (list.view !== `mailbox:${mailbox}`) leave(threads);
	void undoable({ action: 'move', mailbox }, threads, `Moved to ${name}`);
}

export function snooze(at: number, threads: number[]) {
	if (!threads.length) return;
	if (list.view !== 'later') leave(threads);
	void undoable({ action: 'snooze', until: at }, threads, `Back ${until(at)}`);
}

export async function wake(threads: number[]) {
	if (list.view === 'later') leave(threads);
	await api.act({ action: 'unsnooze' }, { threads }).catch(toasts.fail);
	await refreshAll();
}

export async function setRead(threads: number[], read: boolean) {
	for (const thread of threads) {
		const row = list.rows.find((candidate) => candidate.thread === thread);
		list.update(thread, { unread: read ? 0 : Math.max(1, row?.count ?? 1) });
	}
	await api.act({ action: read ? 'read' : 'unread' }, { threads }).catch(toasts.fail);
	void mail.refresh();
	if (reader.thread !== null && threads.includes(reader.thread)) void reader.refresh();
}

export async function setStar(threads: number[], starred: boolean) {
	for (const thread of threads) list.update(thread, { flagged: starred });
	if (!starred && list.view === 'starred') leave(threads);
	await api.act({ action: starred ? 'star' : 'unstar' }, { threads }).catch(toasts.fail);
	if (reader.thread !== null && threads.includes(reader.thread)) void reader.refresh();
}

export async function screen(address: string, verdict: 'approved' | 'denied', threads: number[]) {
	if (list.view === 'screener' || list.view === 'screened') leave(threads);
	await api.screen(address, verdict).catch(toasts.fail);
	toasts.show(verdict === 'approved' ? `${address} can reach your inbox` : `${address} is screened out`, {
		action: { label: 'Undo', run: () => void api.screen(address, verdict === 'approved' ? 'denied' : 'approved').then(refreshAll) }
	});
	await refreshAll();
}

export async function unsubscribe(id: number, sender: string, thread: number) {
	try {
		const result = await api.unsubscribe(id);
		if (result === 'opened') return toasts.show('Finish unsubscribing in your browser');
		move('archive', [thread], `Unsubscribed from ${sender}`);
	} catch (error) {
		toasts.fail(error);
	}
}
