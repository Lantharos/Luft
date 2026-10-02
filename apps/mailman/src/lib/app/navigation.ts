import * as api from '$lib/api';
import { setRead } from '$lib/mail/actions';
import { list } from '$lib/mail/list.svelte';
import { mail } from '$lib/mail/mail.svelte';
import { reader } from '$lib/reader/reader.svelte';

export function navigate(view: string) {
	reader.close();
	void list.open(view);
	const mailbox = view.startsWith('mailbox:') ? mail.mailboxes.find((candidate) => `mailbox:${candidate.id}` === view) : null;
	if (mailbox) void api.syncMailbox(mailbox.account, mailbox.id);
}

export async function openThread(thread: number | null) {
	list.select(thread);
	await reader.open(thread);
	if (thread !== null && reader.thread === thread && reader.messages.some((message) => !message.seen)) await setRead([thread], true);
}
