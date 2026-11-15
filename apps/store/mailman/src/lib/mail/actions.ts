import { t } from '@luft/i18n';
import { ago } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { Action } from '#lib/bindings.js';
import * as api from '#lib/bridge/index.js';
import { reader } from '#lib/reader/reader.svelte.js';
import { toasts } from '#lib/shell/toasts.svelte.js';
import { list } from './list.svelte';
import { mail } from './mail.svelte';

type Mover = 'archive' | 'trash' | 'spam' | 'inbox' | 'deleteForever';

const MOVED: Record<Mover, (count: number) => string> = {
	archive: (count) => t('mailman-done-archived', { count }),
	trash: (count) => t('mailman-done-trashed', { count }),
	spam: (count) => t('mailman-done-junk', { count }),
	inbox: (count) => t('mailman-done-inbox', { count }),
	deleteForever: (count) => t('mailman-done-deleted', { count })
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
		const undo = await commands.act({ ...action, threads });
		toasts.show(message, {
			action: undo.moves.length
				? { label: t('mailman-undo'), run: () => void restore(undo.moves) }
				: action.action === 'snooze'
					? { label: t('mailman-undo'), run: () => void commands.act({ action: 'unsnooze', threads }).then(refreshAll) }
					: undefined
		});
	} catch (error) {
		toasts.fail(error);
		await refreshAll();
	}
}

async function restore(moves: { id: number; mailbox: number }[]) {
	await commands.act({ action: 'restore', moves, ids: moves.map((move) => move.id) });
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
	const name = mail.mailboxes.find((candidate) => candidate.id === mailbox)?.name;
	if (list.view !== `mailbox:${mailbox}`) leave(threads);
	void undoable({ action: 'move', mailbox }, threads, name ? t('mailman-done-moved', { folder: name }) : t('mailman-done-moved-folder'));
}

export function snooze(at: number, threads: number[]) {
	if (!threads.length) return;
	if (list.view !== 'later') leave(threads);
	void undoable({ action: 'snooze', until: at }, threads, t('mailman-done-snoozed', { when: ago(at) }));
}

export async function wake(threads: number[]) {
	if (list.view === 'later') leave(threads);
	await commands.act({ action: 'unsnooze', threads }).catch(toasts.fail);
	await refreshAll();
}

export async function setRead(threads: number[], read: boolean) {
	for (const thread of threads) {
		const row = list.rows.find((candidate) => candidate.thread === thread);
		list.update(thread, { unread: read ? 0 : Math.max(1, row?.count ?? 1) });
	}
	await commands.act({ action: read ? 'read' : 'unread', threads }).catch(toasts.fail);
	void mail.refresh();
	if (reader.thread !== null && threads.includes(reader.thread)) void reader.refresh();
}

export async function setStar(threads: number[], starred: boolean) {
	for (const thread of threads) list.update(thread, { flagged: starred });
	if (!starred && list.view === 'starred') leave(threads);
	await commands.act({ action: starred ? 'star' : 'unstar', threads }).catch(toasts.fail);
	if (reader.thread !== null && threads.includes(reader.thread)) void reader.refresh();
}

export async function screen(address: string, verdict: 'approved' | 'denied', threads: number[]) {
	if (list.view === 'screener' || list.view === 'screened') leave(threads);
	const previous = await commands.screen({ address, verdict }).catch(toasts.fail);
	if (previous)
		toasts.show(verdict === 'approved' ? t('mailman-done-approved', { address }) : t('mailman-done-screened-out', { address }), {
			action: { label: t('mailman-undo'), run: () => void commands.screen({ address, verdict: previous }).then(refreshAll) }
		});
	await refreshAll();
}

export async function unsubscribe(id: number, sender: string, thread: number) {
	try {
		const result = await api.unsubscribe(id);
		if (result === 'opened') return toasts.show(t('mailman-unsubscribe-in-browser'));
		move('archive', [thread], t('mailman-unsubscribed', { sender }));
	} catch (error) {
		toasts.fail(error);
	}
}
