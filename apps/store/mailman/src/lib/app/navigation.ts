import { keepWindowState } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import { setRead } from '#lib/mail/actions.js';
import { list } from '#lib/mail/list.svelte.js';
import { mail } from '#lib/mail/mail.svelte.js';
import { reader } from '#lib/reader/reader.svelte.js';

export function navigate(view: string) {
	reader.close();
	void list.open(view);
	const mailbox = view.startsWith('mailbox:') ? mail.mailboxes.find((candidate) => `mailbox:${candidate.id}` === view) : null;
	if (mailbox) void commands.syncMailbox({ account: mailbox.account, mailbox: mailbox.id });
}

export async function openThread(thread: number | null) {
	list.select(thread);
	await reader.open(thread);
	if (thread !== null && reader.thread === thread && reader.messages.some((message) => !message.seen)) await setRead([thread], true);
}

export interface Reading {
	view: string;
	thread: number | null;
}

export async function reopen({ view, thread }: Reading = { view: 'inbox', thread: null }) {
	await list.open(view);
	if (thread !== null) await openThread(thread);
}

export function keepReading() {
	keepWindowState((): Reading => ({ view: list.view, thread: list.selected }));
}
