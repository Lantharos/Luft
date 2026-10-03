import * as api from '#lib/api/index.js';
import type { Address, Attached, Draft, Message, Rendered } from '#lib/api/index.js';
import { longDate } from '#lib/app/format.js';
import { mail } from '#lib/mail/mail.svelte.js';
import { reader } from '#lib/reader/reader.svelte.js';
import { toasts } from '#lib/shell/toasts.svelte.js';
import { escapeHtml, signatureHtml } from './html';
import { ownIdentity, sendingFor, type Sending } from './identity';
import { parseMailto } from './mailto';

export interface Attachment extends Attached {
	size: number;
}

export interface Composition {
	key: number;
	account: number;
	identity: number;
	from: string | null;
	to: Address[];
	cc: Address[];
	bcc: Address[];
	showCopies: boolean;
	subject: string;
	body: string;
	quote: string;
	attachments: Attachment[];
	inReplyTo: string | null;
	references: string[];
	replaces: number | null;
	remindAfter: number | null;
}

export interface Content {
	source: string;
	html: string;
	text: string;
	inline: Attached[];
	empty: boolean;
}

function prefixed(subject: string, prefix: 'Re' | 'Fwd') {
	return new RegExp(`^${prefix}:`, 'i').test(subject) ? subject : `${prefix}: ${subject}`;
}

function quoteOf(message: Message, rendered: Rendered | null) {
	const name = message.senderName || message.sender;
	const body = rendered ? (rendered.plain ? `<div style="white-space:pre-wrap">${escapeHtml(rendered.text)}</div>` : rendered.html) : escapeHtml(message.snippet);
	return `<div>On ${escapeHtml(longDate(message.date))}, ${escapeHtml(name)} wrote:</div><blockquote type="cite" style="margin:0 0 0 .8ex;border-left:2px solid #ccc;padding-left:1ex">${body}</blockquote>`;
}

class Composer {
	current = $state<Composition | null>(null);
	expanded = $state(false);
	sending = $state(false);
	private keys = 0;

	defaultAccount() {
		return mail.accounts[0]?.id ?? 0;
	}

	signature(identity: number) {
		const signature = mail.identities.find((candidate) => candidate.id === identity)?.signature ?? '';
		return signature.trim() ? signatureHtml(signature) : '';
	}

	private sendingFrom(account: number, sending: Sending | null): Pick<Composition, 'account' | 'identity' | 'from'> {
		if (sending) return { account: sending.identity.account, identity: sending.identity.id, from: sending.from };
		return { account, identity: mail.preferredIdentity(account)?.id ?? 0, from: null };
	}

	start(partial: Partial<Composition> = {}) {
		if (!mail.accounts.length) return toasts.show('Add an account to write mail');
		const sending = { ...this.sendingFrom(partial.account ?? this.defaultAccount(), null), ...partial };
		this.current = {
			key: ++this.keys,
			...sending,
			to: [],
			cc: [],
			bcc: [],
			showCopies: false,
			subject: '',
			body: `<p><br></p>${this.signature(sending.identity)}`,
			quote: '',
			attachments: [],
			inReplyTo: null,
			references: [],
			replaces: null,
			remindAfter: null,
			...partial
		};
	}

	reply(message: Message, rendered: Rendered | null, all: boolean) {
		const isOwn = (address: string) => mail.accounts.some((account) => account.email === address) || ownIdentity(address, mail.identities) !== null;
		const recipients = message.recipients;
		const from = { name: message.senderName, address: message.sender };
		const replyTo = recipients.replyTo?.length ? recipients.replyTo : [from];
		const sentByMe = isOwn(message.sender);
		const to = sentByMe ? recipients.to : replyTo;
		const others = all ? [...(sentByMe ? [] : recipients.to), ...recipients.cc].filter((address) => !isOwn(address.address) && !to.some((existing) => existing.address === address.address)) : [];
		const references = [...message.references.split(/\s+/).filter(Boolean), ...(message.messageId ? [message.messageId] : [])];
		this.start({
			...this.sendingFrom(mail.account(message.account) ? message.account : this.defaultAccount(), sendingFor(message, mail.identities)),
			to,
			cc: others,
			showCopies: others.length > 0,
			subject: prefixed(message.subject, 'Re'),
			quote: quoteOf(message, rendered),
			inReplyTo: message.messageId,
			references
		});
	}

	forward(message: Message, rendered: Rendered | null) {
		const header = `<div>---------- Forwarded message ----------<br>From: ${escapeHtml(message.senderName)} &lt;${escapeHtml(message.sender)}&gt;<br>Date: ${escapeHtml(longDate(message.date))}<br>Subject: ${escapeHtml(message.subject)}</div>`;
		const body = rendered ? (rendered.plain ? `<div style="white-space:pre-wrap">${escapeHtml(rendered.text)}</div>` : rendered.html) : '';
		this.start({
			...this.sendingFrom(mail.account(message.account) ? message.account : this.defaultAccount(), sendingFor(message, mail.identities)),
			subject: prefixed(message.subject, 'Fwd'),
			quote: `${header}<br>${body}`
		});
	}

	mailto(url: string) {
		const parsed = parseMailto(url);
		this.start({
			to: parsed.to,
			cc: parsed.cc,
			bcc: parsed.bcc,
			showCopies: parsed.cc.length > 0 || parsed.bcc.length > 0,
			subject: parsed.subject,
			body: `<p>${escapeHtml(parsed.body).replace(/\n/g, '<br>') || '<br>'}</p>${this.signature(this.sendingFrom(this.defaultAccount(), null).identity)}`
		});
	}

	async reopen(id: number) {
		try {
			await reader.body(id);
			const draft = await api.reopenDraft(id);
			const from = draft.from.toLowerCase();
			const own = mail.identitiesOf(draft.account).find((identity) => identity.address === from || identity.address === `*@${from.split('@')[1]}`);
			this.start({
				...this.sendingFrom(draft.account, own ? { identity: own, from: own.address.startsWith('*@') ? from : null } : null),
				to: draft.recipients.to,
				cc: draft.recipients.cc,
				showCopies: draft.recipients.cc.length > 0,
				subject: draft.subject,
				body: draft.html || `<p>${escapeHtml(draft.text).replace(/\n/g, '<br>')}</p>`,
				replaces: id
			});
		} catch (error) {
			toasts.fail(error);
		}
	}

	draft(composition: Composition, content: Content, sendAt: number | null): Draft {
		const quote = composition.quote ? `<br>${composition.quote}` : '';
		return {
			account: composition.account,
			identity: composition.identity,
			from: composition.from,
			to: composition.to,
			cc: composition.cc,
			bcc: composition.bcc,
			subject: composition.subject,
			html: `<div>${content.html}${quote}</div>`,
			text: content.text,
			attachments: [...composition.attachments.map(({ path, name }) => ({ path, name, cid: null })), ...content.inline],
			inReplyTo: composition.inReplyTo,
			references: composition.references,
			sendAt,
			remindAfter: composition.remindAfter
		};
	}

	async send(content: Content, sendAt: number | null = null) {
		const composition = this.current;
		if (!composition || this.sending) return;
		this.sending = true;
		try {
			const draft = this.draft(composition, content, sendAt);
			const queued = await api.send(draft);
			if (composition.replaces !== null) await api.act({ action: 'deleteForever' }, { ids: [composition.replaces] });
			this.current = null;
			this.expanded = false;
			const later = sendAt !== null;
			toasts.show(later ? 'Scheduled to send' : 'Sending…', {
				duration: later ? 5000 : Math.max(2000, (queued.sendAt - Date.now() / 1000) * 1000),
				action: { label: 'Undo', run: () => void this.undo(queued.id, { ...composition, body: content.source }) }
			});
		} catch (error) {
			toasts.fail(error);
		} finally {
			this.sending = false;
		}
	}

	private async undo(id: number, composition: Composition) {
		const restored = await api.cancelSend(id);
		if (!restored) return toasts.show('It was already sent');
		this.current = { ...composition, key: ++this.keys };
	}

	async close(content: Content | null) {
		const composition = this.current;
		this.current = null;
		this.expanded = false;
		if (!composition || !content || (content.empty && !composition.subject && !composition.to.length)) return;
		try {
			await api.saveDraft(this.draft(composition, content, null), composition.replaces);
			toasts.show('Saved to Drafts');
		} catch (error) {
			toasts.fail(error);
		}
	}

	discard() {
		const replaces = this.current?.replaces;
		this.current = null;
		this.expanded = false;
		if (replaces) void api.act({ action: 'deleteForever' }, { ids: [replaces] });
	}
}

export const composer = new Composer();
