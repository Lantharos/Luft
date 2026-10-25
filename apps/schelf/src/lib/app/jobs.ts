import type { AppUpdate, InstalledApp, Job } from '#lib/bridge/types.js';

export function removeJob(app: InstalledApp): Job {
	if (app.source === 'flatpak') return { kind: 'removeFlatpak', installation: app.installation!, reference: app.reference! };
	if (app.source === 'package') return { kind: 'removePackage', package: app.package! };
	if (app.source === 'tool') return { kind: 'removeTool', package: app.package! };
	if (app.source === 'debian') return { kind: 'removeDeb', package: app.package! };
	if (app.source === 'system') return { kind: 'removeSystemPackages', packages: [app.id] };
	return { kind: 'removeAppImage', id: app.id };
}

export function updateJob(update: AppUpdate): Job {
	if (update.source === 'flatpak') return { kind: 'updateFlatpaks', installation: update.installation!, references: [update.reference!] };
	if (update.source === 'package') return { kind: 'updatePackages', packages: [update.package!] };
	if (update.source === 'tool') return { kind: 'updateTools', packages: [update.package!] };
	if (update.source === 'debian') return { kind: 'updateDebs', packages: [update.package!] };
	return { kind: 'updateAppImage', id: update.id };
}
