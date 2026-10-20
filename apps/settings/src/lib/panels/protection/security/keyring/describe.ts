import { t } from '@luft/i18n';
import type { AccessEvent, Action, Keyring, KeyKind } from './api';

const KINDS: Record<KeyKind, string> = { ed25519: 'Ed25519', ecdsa: 'ECDSA', rsa: 'RSA' };

const ACTIONS: Record<Action, { named: string; unnamed: string }> = {
	read: { named: 'settings-passwords-history-read', unnamed: 'settings-passwords-history-read-unnamed' },
	saved: { named: 'settings-passwords-history-saved', unnamed: 'settings-passwords-history-saved-unnamed' },
	deleted: { named: 'settings-passwords-history-deleted', unnamed: 'settings-passwords-history-deleted-unnamed' },
	denied: { named: 'settings-passwords-history-denied', unnamed: 'settings-passwords-history-denied-unnamed' },
	signed: { named: 'settings-passwords-history-signed', unnamed: 'settings-passwords-history-signed-unnamed' }
};

export const sealed = (keyring: Keyring) => keyring.chip === 'ready' && keyring.tpmSealed;

export const protection = (keyring: Keyring) => (sealed(keyring) ? t('settings-passwords-protected-chip') : t('settings-passwords-protected'));

export const kind = (key: KeyKind) => KINDS[key];

export const happened = ({ action, app, what }: AccessEvent) => t(ACTIONS[action][what ? 'named' : 'unnamed'], { app, item: what });
