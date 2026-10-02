import type { Appearance } from '@luft/ui';

export type Security = 'tls' | 'startTls' | 'none';
export type Provider = 'google' | 'microsoft';
export type Role = 'inbox' | 'sent' | 'drafts' | 'archive' | 'all' | 'trash' | 'junk';
export type Category = 'primary' | 'newsletter' | 'receipt' | 'notification';

export interface Server {
	host: string;
	port: number;
	security: Security;
}

export type Protocol = { kind: 'imap'; imap: Server; smtp: Server } | { kind: 'jmap'; session: string };

export interface AccountConfig {
	protocol: Protocol;
	username: string;
	oauth: Provider | null;
}

export interface Account {
	id: number;
	email: string;
	name: string;
	config: AccountConfig;
	signature: string;
	added: number;
}

export interface Mailbox {
	id: number;
	account: number;
	remote: string;
	name: string;
	role: Role | null;
	selectable: boolean;
}

export interface Settings {
	screener: boolean;
	bundles: boolean;
	notifications: boolean;
	undoSeconds: number;
	darkMail: boolean;
}

export type Launch = { kind: 'mailto'; url: string } | { kind: 'message'; path: string };

export interface AppState extends Appearance {
	launch: Launch[];
	accounts: Account[];
	mailboxes: Mailbox[];
	settings: Settings;
	oauth: Provider[];
}

export interface Address {
	name: string;
	address: string;
}

export interface ThreadRow {
	thread: number;
	id: number;
	account: number;
	date: number;
	subject: string;
	senderName: string;
	sender: string;
	participants: string;
	snippet: string;
	count: number;
	unread: number;
	flagged: boolean;
	attachments: boolean;
	draft: boolean;
	category: Category;
	unsubscribe: boolean;
	snoozedUntil: number | null;
}

export interface ThreadPage {
	total: number;
	offset: number;
	rows: ThreadRow[];
}

export interface Counts {
	inbox: number;
	screener: number;
	later: number;
	drafts: number;
	newsletter: number;
	receipt: number;
	notification: number;
	mailboxes: [number, number][];
}

export interface Recipients {
	to: Address[];
	cc: Address[];
	replyTo: Address[];
}

export interface Unsubscribe {
	http: string | null;
	mailto: string | null;
	oneClick: boolean;
}

export interface Message {
	id: number;
	account: number;
	mailbox: number;
	role: Role | null;
	messageId: string | null;
	subject: string;
	senderName: string;
	sender: string;
	recipients: Recipients;
	date: number;
	snippet: string;
	seen: boolean;
	flagged: boolean;
	answered: boolean;
	draft: boolean;
	attachments: boolean;
	category: Category;
	unsubscribe: Unsubscribe | null;
	references: string;
}

export interface Attachment {
	index: number;
	name: string;
	mime: string;
	size: number;
	inline: boolean;
}

export interface Rendered {
	html: string;
	plain: boolean;
	designed: boolean;
	remote: string[];
	trackers: number;
	text: string;
	attachments: Attachment[];
}

export interface OpenedFile {
	subject: string;
	from: Address;
	to: Address[];
	cc: Address[];
	date: number | null;
	rendered: Rendered;
}

export interface Discovery {
	imap: Server | null;
	smtp: Server | null;
	jmap: string | null;
	oauth: Provider | null;
	username: string;
}

export interface Attached {
	path: string;
	name: string;
	cid: string | null;
}

export interface Draft {
	account: number;
	to: Address[];
	cc: Address[];
	bcc: Address[];
	subject: string;
	html: string;
	text: string;
	attachments: Attached[];
	inReplyTo: string | null;
	references: string[];
	sendAt: number | null;
	remindAfter: number | null;
}

export interface Template {
	id: number;
	name: string;
	body: string;
}

export interface Chosen {
	path: string;
	name: string;
	size: number;
}

export interface Placement {
	id: number;
	mailbox: number;
}

export type Action =
	| { action: 'archive' | 'trash' | 'spam' | 'inbox' | 'deleteForever' | 'read' | 'unread' | 'star' | 'unstar' | 'unsnooze' }
	| { action: 'snooze'; until: number }
	| { action: 'move'; mailbox: number }
	| { action: 'restore'; moves: Placement[] };

export interface Status {
	account: number;
	state: 'syncing' | 'ready' | 'error';
	message: string | null;
}

export interface OutboxEvent {
	id: number;
	error: string | null;
}

export interface Activation {
	arguments: string[];
	workingDirectory: string | null;
}
