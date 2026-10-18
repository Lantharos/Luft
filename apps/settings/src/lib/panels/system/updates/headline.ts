import { ago } from '@luft/ui';
import { describe } from './activity';
import type { Activity, ImageOverview, Overview, PackageOverview, Release } from './api';
import { recently } from './time';

const BACK_SOON = 'Your computer is back in a few minutes.';

export const versionName = (release: Release) => (release.version ? `Version ${release.version}` : 'A new version');

function packagesHeadline({ prepared, updates }: PackageOverview) {
	if (prepared) return 'Updates are ready to install';
	if (updates.length) return `${updates.length} ${updates.length === 1 ? 'update is' : 'updates are'} available`;
	return 'Your system is up to date';
}

function imageHeadline({ returning, switching, staged, available }: ImageOverview) {
	if (returning) return `Ready to go back to ${versionName(returning).toLowerCase()}`;
	if (switching) return switching === 'nvidia' ? "NVIDIA's driver is ready" : 'The standard image is ready';
	if (available) return `${versionName(available)} is available`;
	if (staged) return `${versionName(staged)} is ready to install`;
	return 'Your system is up to date';
}

export function headline(overview: Overview | null, activity: Activity) {
	const running = describe(activity);
	if (running) return running;
	if (!overview) return 'Looking for updates…';
	return overview.system.kind === 'packages' ? packagesHeadline(overview.system) : imageHeadline(overview.system);
}

function waiting(overview: Overview) {
	const system = overview.system;
	if (system.kind === 'packages') return system.prepared ? `Restart to install them. ${BACK_SOON}` : null;
	if (system.returning) return 'Restart to finish going back.';
	if (system.switching) return `Restart to finish. ${BACK_SOON}`;
	return system.staged && !system.available ? `Restart to install it. ${BACK_SOON}` : null;
}

export function subline(overview: Overview | null, activity: Activity, failure: string | null) {
	const error = failure ?? activity.error;
	if (error) return error;
	if (activity.running === 'elsewhere') return "You can look for updates again when it's done";
	if (!overview) return '';
	const restart = waiting(overview);
	if (restart) return restart;
	const parts = [overview.checked ? `Last checked ${ago(overview.checked)}` : 'Not checked yet'];
	const results = overview.system.kind === 'packages' ? overview.system.results : null;
	if (results?.success && recently(results.finished)) parts.push(`updates installed ${ago(results.finished)}`);
	return parts.join(' · ');
}
