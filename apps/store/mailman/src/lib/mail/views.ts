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
import { t } from '@luft/i18n';
import type { Component } from 'svelte';
import type { Counts, Mailbox } from '#lib/bindings.js';

export interface ViewInfo {
	id: string;
	label: () => string;
	icon: Component;
	key?: string;
	count?: (counts: Counts) => number;
	total?: boolean;
}

export const PRIMARY: ViewInfo[] = [
	{ id: 'inbox', label: () => t('mailman-view-inbox'), icon: Inbox, key: 'i', count: (counts) => counts.inbox },
	{ id: 'screener', label: () => t('mailman-view-screener'), icon: UserCheck, key: 'k', count: (counts) => counts.screener, total: true },
	{ id: 'later', label: () => t('mailman-view-later'), icon: Clock, key: 'l', count: (counts) => counts.later, total: true },
	{ id: 'starred', label: () => t('mailman-view-starred'), icon: Star, key: 's' },
	{ id: 'drafts', label: () => t('mailman-view-drafts'), icon: FileText, key: 'd', count: (counts) => counts.drafts, total: true },
	{ id: 'sent', label: () => t('mailman-view-sent'), icon: Send, key: 't' },
	{ id: 'archive', label: () => t('mailman-view-archive'), icon: Archive, key: 'a' },
	{ id: 'junk', label: () => t('mailman-view-junk'), icon: ShieldAlert, key: 'j' },
	{ id: 'trash', label: () => t('mailman-view-trash'), icon: Trash, key: 'x' }
];

export const BUNDLES: ViewInfo[] = [
	{ id: 'bundle:newsletter', label: () => t('mailman-view-newsletters'), icon: Newspaper, key: 'n', count: (counts) => counts.newsletter },
	{ id: 'bundle:receipt', label: () => t('mailman-view-receipts'), icon: Receipt, key: 'r', count: (counts) => counts.receipt },
	{ id: 'bundle:notification', label: () => t('mailman-view-updates'), icon: Bell, key: 'u', count: (counts) => counts.notification }
];

export function mailboxView(mailbox: Mailbox): ViewInfo {
	return { id: `mailbox:${mailbox.id}`, label: () => mailbox.name, icon: Folder };
}

export function viewLabel(id: string, mailboxes: Mailbox[]) {
	const known = [...PRIMARY, ...BUNDLES].find((view) => view.id === id);
	if (known) return known.label();
	const mailbox = mailboxes.find((candidate) => `mailbox:${candidate.id}` === id);
	return mailbox?.name ?? t('mailman-header-mail');
}
