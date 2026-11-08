import { t } from '@luft/i18n';
import type { AuthorizedKey, RemoteLogin } from '#lib/bindings.js';

const ALGORITHMS: [string, string][] = [
	['ed25519', 'Ed25519'],
	['ecdsa', 'ECDSA'],
	['rsa', 'RSA']
];
const SECURITY_KEY = 'sk-';

export function keyKind(kind: string) {
	const algorithm = ALGORITHMS.find(([part]) => kind.includes(part))?.[1] ?? kind;
	return kind.startsWith(SECURITY_KEY) ? t('settings-remote-login-kind-security-key', { kind: algorithm }) : algorithm;
}

export const keyName = (key: AuthorizedKey) => key.comment || t('settings-remote-login-key-unnamed');

export function remoteLoginSummary(remote: RemoteLogin) {
	if (!remote.enabled) return t('settings-remote-login-off');
	return remote.publicNetworks ? t('settings-remote-login-on-everywhere') : t('settings-remote-login-on-home');
}
