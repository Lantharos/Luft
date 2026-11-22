import { t } from '@luft/i18n';
import { longDuration } from '@luft/ui';
import type { AppSource, Policy } from '#lib/bindings.js';

const SOURCES: Record<AppSource, string> = {
	'schelf-store': 'schelf.store',
	flathub: 'Flathub',
	appimage: 'AppImage',
	ubuntu: 'Ubuntu'
};

const SCHEDULES = { daily: 'settings-managed-updates-daily', weekly: 'settings-managed-updates-weekly', never: 'settings-managed-updates-never' };
const CHANNELS = { stable: 'settings-managed-channel-stable', nightly: 'settings-managed-channel-nightly' };
const NEARBY = { 'no-one': 'settings-managed-nearby-no-one', 'your-devices': 'settings-managed-nearby-your-devices', everyone: 'settings-managed-nearby-everyone' };
const CRASH_REPORTS = { always: 'settings-managed-crash-reports-always', never: 'settings-managed-crash-reports-never' };

const when = (decided: boolean, line: string) => (decided ? [t(line)] : []);

function screen({ 'screen-lock': lock }: Policy): string[] {
	const off = lock['screen-off'];
	const after = lock['lock-after'];
	return [
		...(lock.enabled == null ? [] : [t(lock.enabled ? 'settings-managed-lock-on' : 'settings-managed-lock-off')]),
		...(off == null ? [] : [off ? t('settings-managed-screen-off', { duration: longDuration(off) }) : t('settings-managed-screen-stays-on')]),
		...(after == null ? [] : [after ? t('settings-managed-lock-after', { duration: longDuration(after) }) : t('settings-managed-lock-at-once')])
	];
}

function updates({ updates }: Policy): string[] {
	return [
		...(updates.schedule ? [t(SCHEDULES[updates.schedule])] : []),
		...(updates.download == null ? [] : [t(updates.download ? 'settings-managed-download-on' : 'settings-managed-download-off')]),
		...(updates.channel ? [t(CHANNELS[updates.channel])] : [])
	];
}

function software({ software, developer, extensions, encryption }: Policy): string[] {
	const sources = software['app-sources'];
	const list = new Intl.ListFormat(undefined, { type: 'disjunction' });
	return [
		...when(!software['system-packages'], 'settings-managed-system-packages'),
		...when(!software['package-sources'], 'settings-managed-package-sources'),
		...(sources ? [sources.length ? t('settings-managed-app-sources', { sources: list.format(sources.map((source) => SOURCES[source])) }) : t('settings-managed-no-apps')] : []),
		...(developer.tools == null ? [] : [t(developer.tools ? 'settings-managed-developer-on' : 'settings-managed-developer-off')]),
		...when(!extensions.unreviewed, 'settings-managed-unreviewed-extensions'),
		...when(encryption.required, 'settings-managed-encryption')
	];
}

function access({ firewall, accounts, 'remote-login': remote, 'nearby-sharing': nearby, 'crash-reports': crashes }: Policy): string[] {
	return [
		...when(!firewall['home-networks'], 'settings-managed-home-networks'),
		...when(!firewall['public-access'], 'settings-managed-public-access'),
		...when(!firewall['open-ports'], 'settings-managed-open-ports'),
		...when(!accounts.add || !accounts.administrators, 'settings-managed-accounts'),
		...when(!accounts['automatic-sign-in'], 'settings-managed-automatic-sign-in'),
		...when(!remote.allowed, 'settings-managed-remote-login-off'),
		...when(remote.allowed && !remote.passwords, 'settings-managed-remote-login-keys'),
		...(nearby['visible-to'] ? [t(NEARBY[nearby['visible-to']])] : []),
		...(crashes.send ? [t(CRASH_REPORTS[crashes.send])] : [])
	];
}

/** Each setting the organization decided, in plain words. */
export const managed = (policy: Policy): string[] => [...screen(policy), ...updates(policy), ...software(policy), ...access(policy)];
