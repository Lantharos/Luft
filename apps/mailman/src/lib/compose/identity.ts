import type { ConversationMessage, Identity } from '#lib/bindings.js';

export interface Sending {
	identity: Identity;
	from: string | null;
}

const ADDRESS = /^[^\s@<>,;*][^\s@<>,;]*@[^\s@<>,;]+\.[^\s@<>,;]+$/;

export function isWildcard(identity: Identity) {
	return identity.address.startsWith('*@');
}

export function isAddress(address: string) {
	return ADDRESS.test(address.trim());
}

function split(address: string) {
	const at = address.lastIndexOf('@');
	return { local: address.slice(0, at).toLowerCase(), domain: address.slice(at + 1).toLowerCase() };
}

function withoutTag(local: string) {
	return local.split('+')[0];
}

function exact(identity: Identity, address: string) {
	if (isWildcard(identity)) return false;
	const wanted = split(address);
	const own = split(identity.address);
	return own.domain === wanted.domain && (own.local === wanted.local || own.local === withoutTag(wanted.local));
}

function wildcard(identity: Identity, address: string) {
	return isWildcard(identity) && split(address).domain === identity.address.slice(2).toLowerCase();
}

export function covers(identity: Identity, address: string) {
	return isWildcard(identity) ? wildcard(identity, address) : identity.address === address.trim().toLowerCase();
}

function sameDomain(identity: Identity, address: string) {
	return split(identity.address).domain === split(address).domain;
}

export function ownIdentity(address: string, identities: Identity[]): Sending | null {
	const lower = address.toLowerCase();
	const found = identities.find((identity) => identity.address === lower) ?? identities.find((identity) => wildcard(identity, lower));
	return found ? { identity: found, from: isWildcard(found) ? lower : null } : null;
}

export function sendingFor(message: ConversationMessage, identities: Identity[]): Sending | null {
	const own = ownIdentity(message.sender, identities);
	if (own) return own;
	const recipients = [...message.recipients.to, ...message.recipients.cc, ...(message.recipients.delivered ?? [])].map((address) => address.address.toLowerCase());
	const ranked = [...identities].sort((a, b) => Number(b.account === message.account) - Number(a.account === message.account));
	for (const address of recipients) {
		const found = ranked.find((identity) => exact(identity, address));
		if (found) return { identity: found, from: null };
	}
	for (const address of recipients) {
		const found = ranked.find((identity) => wildcard(identity, address));
		if (found) return { identity: found, from: address };
	}
	for (const address of recipients) {
		const found = ranked.find((identity) => identity.account === message.account && sameDomain(identity, address));
		if (found) return { identity: found, from: null };
	}
	return null;
}
