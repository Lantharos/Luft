import type { AppUpdate, InstalledApp, Job, StoreDetails } from '#lib/bindings.js';

export function removeJob(app: InstalledApp): Job {
	if (app.listing) return { kind: 'removeStore', id: app.listing };
	if (app.source === 'flatpak') return { kind: 'removeFlatpak', installation: app.installation!, reference: app.reference! };
	if (app.source === 'debian') return { kind: 'removeDeb', package: app.package! };
	if (app.source === 'system') return { kind: 'removeSystemPackages', packages: [app.id] };
	if (app.source === 'storeTool') return { kind: 'removeStoreTool', name: app.id };
	return { kind: 'removeAppImage', id: app.id };
}

export function updateJob(update: AppUpdate): Job {
	if (update.store) return { kind: 'updateStore', id: update.store.id, consent: update.store.consent };
	if (update.source === 'flatpak') return { kind: 'updateFlatpaks', installation: update.installation!, references: [update.reference!] };
	if (update.source === 'system') return { kind: 'updateSystemPackages' };
	if (update.source === 'debian') return { kind: 'updateDebs' };
	if (update.source === 'storeTool') return { kind: 'updateStoreTool', name: update.id };
	return { kind: 'updateAppImage', id: update.id };
}

export function storeJob(store: StoreDetails, fullAccess: boolean, updating = false): Job | null {
	if (!store.installer || !store.version) return null;
	const consent = { version: store.version, permissions: store.declared, extension: store.extension, fullAccess };
	return updating ? { kind: 'updateStore', id: store.id, consent } : { kind: 'installStore', id: store.id, consent };
}
