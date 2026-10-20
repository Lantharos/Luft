import { t } from '@luft/i18n';
import { ago } from '@luft/ui';
import { describe } from './activity';
import type { Activity, ImageOverview, Overview, PackageOverview, Release } from './api';
import { recently } from './time';

export const named = (release: Release, versioned: string, unversioned: string) =>
	release.version ? t(versioned, { version: release.version }) : t(unversioned);

export const versionName = (release: Release) => named(release, 'settings-updates-version', 'settings-updates-version-new');

function packagesHeadline({ prepared, updates }: PackageOverview) {
	if (prepared) return t('settings-updates-ready');
	if (updates.length) return t('settings-updates-available', { count: updates.length });
	return t('settings-updates-up-to-date');
}

function imageHeadline({ returning, switching, staged, available }: ImageOverview) {
	if (returning) return named(returning, 'settings-updates-returning', 'settings-updates-returning-unversioned');
	if (switching) return switching === 'nvidia' ? t('settings-updates-nvidia-ready') : t('settings-updates-standard-ready');
	if (available) return named(available, 'settings-updates-version-available', 'settings-updates-version-available-new');
	if (staged) return named(staged, 'settings-updates-version-staged', 'settings-updates-version-staged-new');
	return t('settings-updates-up-to-date');
}

export function headline(overview: Overview | null, activity: Activity) {
	const running = describe(activity);
	if (running) return running;
	if (!overview) return t('settings-updates-checking');
	return overview.system.kind === 'packages' ? packagesHeadline(overview.system) : imageHeadline(overview.system);
}

function waiting(overview: Overview) {
	const system = overview.system;
	if (system.kind === 'packages') return system.prepared ? t('settings-updates-restart-install-them') : null;
	if (system.returning) return t('settings-updates-restart-return');
	if (system.switching) return t('settings-updates-restart-switch');
	return system.staged && !system.available ? t('settings-updates-restart-install-it') : null;
}

export function subline(overview: Overview | null, activity: Activity, failure: string | null) {
	const error = failure ?? activity.error;
	if (error) return error;
	if (activity.running === 'elsewhere') return t('settings-updates-elsewhere-wait');
	if (!overview) return '';
	const restart = waiting(overview);
	if (restart) return restart;
	const parts = [overview.checked ? t('settings-updates-last-checked', { when: ago(overview.checked) }) : t('settings-updates-never-checked')];
	const results = overview.system.kind === 'packages' ? overview.system.results : null;
	if (results?.success && recently(results.finished)) parts.push(t('settings-updates-installed-when', { when: ago(results.finished) }));
	return parts.join(' · ');
}
