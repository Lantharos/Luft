import { invoke, isAvailable, listen } from '@lantharos/sabine';
import type {
	Account,
	AccountConfig,
	Action,
	Activation,
	Address,
	AppState,
	Chosen,
	Counts,
	Discovery,
	Draft,
	Launch,
	Mailbox,
	Message,
	OpenedFile,
	OutboxEvent,
	Placement,
	Provider,
	Rendered,
	Settings,
	Status,
	Template,
	ThreadPage
} from './types';

export * from './types';

const LONG = 10 * 60 * 1000;
const FOREVER = 24 * 60 * 60 * 1000;

export const isDesktop = isAvailable;

function call<T>(name: string, params: Record<string, unknown> = {}, timeoutMs?: number): Promise<T> {
	return invoke<T>(name, params, timeoutMs ? { timeoutMs } : undefined);
}

function on<T>(name: string, callback: (payload: T) => void): () => void {
	return isAvailable() ? listen<T>(name, callback) : () => {};
}

export type Secret = { kind: 'password'; password: string } | { kind: 'oAuth'; provider: Provider };

export const appState = () => call<AppState>('app_state');
export const resolveArguments = (activation: Activation) => call<Launch[]>('resolve_arguments', { ...activation });
export const setFocused = (focused: boolean) => call<void>('set_focused', { focused });
export const saveSettings = (settings: Settings) => call<void>('save_settings', { settings });

export const discover = (email: string) => call<Discovery>('discover', { email }, LONG);
export const addAccount = (email: string, name: string, config: AccountConfig, secret: Secret) =>
	call<Account>('add_account', { email, name, config, secret }, LONG);
export const removeAccount = (id: number) => call<void>('remove_account', { id });
export const updateAccount = (id: number, name: string, signature: string) => call<void>('update_account', { id, name, signature });
export const accounts = () => call<Account[]>('accounts');
export const mailboxes = () => call<Mailbox[]>('mailboxes');
export const syncNow = () => call<void>('sync_now');
export const syncMailbox = (account: number, mailbox: number) => call<void>('sync_mailbox', { account, mailbox });

export const threads = (view: string, query: string | null, offset: number, limit: number) => call<ThreadPage>('threads', { view, query, offset, limit });
export const counts = () => call<Counts>('counts');
export const conversation = (thread: number) => call<Message[]>('conversation', { thread });
export const messageBody = (id: number) => call<Rendered | null>('message_body', { id });
export const remoteImages = (urls: string[]) => call<void>('remote_images', { urls });
export const allowImages = (address: string, allowed: boolean) => call<void>('allow_images', { address, allowed });
export const imagesAllowed = (email: string) => call<boolean>('images_allowed', { email });
export const act = (action: Action, target: { threads?: number[]; ids?: number[] }) => call<{ moves: Placement[] }>('act', { ...action, ...target });
export const screen = (address: string, verdict: 'approved' | 'denied') => call<void>('screen', { address, verdict });
export type PartSource = { id: number } | { file: string };
export const openAttachment = (source: PartSource, index: number) => call<void>('open_attachment', { ...source, index }, LONG);
export const saveAttachment = (source: PartSource, index: number) => call<string | null>('save_attachment', { ...source, index }, FOREVER);
export const contacts = (query: string) => call<Address[]>('contacts', { query });
export const openMessageFile = (path: string) => call<OpenedFile>('open_message_file', { path });
export const openUri = (uri: string) => call<void>('open_uri', { uri });

export const send = (draft: Draft) => call<{ id: number; sendAt: number }>('send', { draft });
export const cancelSend = (id: number) => call<Draft | null>('cancel_send', { id });
export const saveDraft = (draft: Draft, replaces: number | null) => call<void>('save_draft', { draft, replaces });
export const reopenDraft = (id: number) => call<{ account: number; recipients: Message['recipients']; subject: string; html: string; text: string }>('reopen_draft', { id }, LONG);
export const unsubscribe = (id: number) => call<'done' | 'opened'>('unsubscribe', { id }, LONG);
export const chooseFiles = () => call<Chosen[]>('choose_files', {}, FOREVER);
export const stashFile = (name: string, data: string) => call<string>('stash_file', { name, data });
export const templates = () => call<Template[]>('templates');
export const saveTemplate = (id: number | null, name: string, body: string) => call<void>('save_template', { id, name, body });
export const deleteTemplate = (id: number) => call<void>('delete_template', { id });

export const events = {
	changed: (callback: (account: number) => void) => on('mailman.changed', callback),
	status: (callback: (status: Status) => void) => on('mailman.status', callback),
	open: (callback: (activation: { thread: number | null; token: string | null }) => void) => on('mailman.open', callback),
	outbox: (callback: (event: OutboxEvent) => void) => on('mailman.outbox', callback),
	body: (callback: (arrived: { id: number; error: string | null }) => void) => on('mailman.body', callback),
	images: (callback: (images: [string, string | null][]) => void) => on('mailman.images', callback),
	activation: (callback: (activation: Activation) => void) => on('singleInstance.activate', callback)
};
