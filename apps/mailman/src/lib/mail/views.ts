import Archive from '@lucide/svelte/icons/archive';
import Bell from '@lucide/svelte/icons/bell';
import Clock from '@lucide/svelte/icons/clock';
import FileText from '@lucide/svelte/icons/file-pen';
import Folder from '@lucide/svelte/icons/folder';
import Inbox from '@lucide/svelte/icons/inbox';
import Newspaper from '@lucide/svelte/icons/newspaper';
import Receipt from '@lucide/svelte/icons/receipt';
import Send from '@lucide/svelte/icons/send';
import ShieldAlert from '@lucide/svelte/icons/shield-alert';
import Star from '@lucide/svelte/icons/star';
import Trash from '@lucide/svelte/icons/trash-2';
import UserCheck from '@lucide/svelte/icons/user-round-check';
import type { Component } from 'svelte';
import type { Counts, Mailbox } from '$lib/api';

export interface ViewInfo {
	id: string;
	label: string;
	icon: Component;
	key?: string;
	count?: (counts: Counts) => number;
	total?: boolean;
}

export const PRIMARY: ViewInfo[] = [
	{ id: 'inbox', label: 'Inbox', icon: Inbox, key: 'i', count: (counts) => counts.inbox },
	{ id: 'screener', label: 'Screener', icon: UserCheck, key: 'k', count: (counts) => counts.screener, total: true },
	{ id: 'later', label: 'Later', icon: Clock, key: 'l', count: (counts) => counts.later, total: true },
	{ id: 'starred', label: 'Starred', icon: Star, key: 's' },
	{ id: 'drafts', label: 'Drafts', icon: FileText, key: 'd', count: (counts) => counts.drafts, total: true },
	{ id: 'sent', label: 'Sent', icon: Send, key: 't' },
	{ id: 'archive', label: 'Archive', icon: Archive, key: 'a' },
	{ id: 'junk', label: 'Junk', icon: ShieldAlert, key: 'j' },
	{ id: 'trash', label: 'Trash', icon: Trash, key: 'x' }
];

export const BUNDLES: ViewInfo[] = [
	{ id: 'bundle:newsletter', label: 'Newsletters', icon: Newspaper, key: 'n', count: (counts) => counts.newsletter },
	{ id: 'bundle:receipt', label: 'Receipts', icon: Receipt, key: 'r', count: (counts) => counts.receipt },
	{ id: 'bundle:notification', label: 'Updates', icon: Bell, key: 'u', count: (counts) => counts.notification }
];

export function mailboxView(mailbox: Mailbox): ViewInfo {
	return { id: `mailbox:${mailbox.id}`, label: mailbox.name, icon: Folder };
}

export function viewLabel(id: string, mailboxes: Mailbox[]) {
	const known = [...PRIMARY, ...BUNDLES].find((view) => view.id === id);
	if (known) return known.label;
	const mailbox = mailboxes.find((candidate) => `mailbox:${candidate.id}` === id);
	return mailbox?.name ?? 'Mail';
}
