import type { AppUpdate, InstalledApp, Job } from '#lib/bridge/types.js';

export function removeJob(app: InstalledApp): Job {
	if (app.source === 'flatpak') return { kind: 'removeFlatpak', installation: app.installation!, reference: app.reference! };
	if (app.source === 'package') return { kind: 'removePackage', package: app.package! };
	return { kind: 'removeAppImage', id: app.id };
}

export function updateJob(update: AppUpdate): Job {
	if (update.source === 'flatpak') return { kind: 'updateFlatpaks', installation: update.installation!, references: [update.reference!] };
	if (update.source === 'package') return { kind: 'updatePackages', packages: [update.package!] };
	return { kind: 'updateAppImage', id: update.id };
}
