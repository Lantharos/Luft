import { t } from '@luft/i18n';
import { ago } from '@luft/ui';
import type { Activity, ImageOverview, Release, UpdatesOverview } from '#lib/bindings.js';
import { versionLabel } from '../version';
import { describe } from './activity';

export const named = (release: Release, versioned: string, unversioned: string) =>
	release.version ? t(versioned, { version: versionLabel(release.version) }) : t(unversioned);

export const versionName = (release: Release) => named(release, 'settings-updates-version', 'settings-updates-version-new');

function systemHeadline({ returning, switching, staged, available }: ImageOverview) {
	if (returning) return named(returning, 'settings-updates-returning', 'settings-updates-returning-unversioned');
	if (switching) return switching === 'nvidia' ? t('settings-updates-nvidia-ready') : t('settings-updates-standard-ready');
	if (available) return named(available, 'settings-updates-version-available', 'settings-updates-version-available-new');
	if (staged) return named(staged, 'settings-updates-version-staged', 'settings-updates-version-staged-new');
	return null;
}

export function headline(overview: UpdatesOverview | null, activity: Activity) {
	const running = describe(activity);
	if (running) return running;
	if (!overview) return t('settings-updates-checking');
	return systemHeadline(overview.system) ?? t(overview.checked ? 'settings-updates-up-to-date' : 'settings-updates-never-checked');
}

function waiting({ system }: UpdatesOverview) {
	if (system.returning) return t('settings-updates-restart-return');
	if (system.switching) return t('settings-updates-restart-switch');
	return system.staged && !system.available ? t('settings-updates-restart-install-it') : null;
}

export function subline(overview: UpdatesOverview | null, activity: Activity, failure: string | null) {
	const error = failure ?? activity.error;
	if (error) return error;
	if (!overview) return '';
	const restart = waiting(overview);
	if (restart) return restart;
	return overview.checked ? t('settings-updates-last-checked', { when: ago(overview.checked) }) : '';
}
