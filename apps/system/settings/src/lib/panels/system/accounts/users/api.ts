import { t } from '@luft/i18n';
import { commands } from '#lib/bindings.js';
import type { User } from '#lib/bindings.js';

const WAIT_FOR_PERMISSION = 300_000;

export const choosePicture = () => commands.usersChoosePicture({ timeoutMs: WAIT_FOR_PERMISSION });
export const changePassword = (current: string | null, password: string) =>
	commands.usersChangePassword({ current, password }, { timeoutMs: WAIT_FOR_PERMISSION });

export const displayName = (user: User) => user.realName || user.userName;
export const accountType = (user: User) => (user.administrator ? t('settings-users-administrator') : t('settings-users-standard'));
