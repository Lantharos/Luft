import * as api from '$lib/api';
import { isDesktopRuntime } from '$lib/runtime';
import type { FileEntry } from '$lib/types';
import type { FileDetails, OpenWithApps } from '$lib/types/details';

export type MediaInfo = { width: number | null; height: number | null; duration: number | null };

const NO_APPS: OpenWithApps = { default: null, others: [] };

export class EntryDetails {
	details = $state.raw<FileDetails | null>(null);
	apps = $state.raw<OpenWithApps>(NO_APPS);
	media = $state.raw<MediaInfo | null>(null);
	#key = '';

	load = (entry: FileEntry | null) => {
		const key = entry ? `${entry.path}:${entry.modified}` : '';
		if (key === this.#key) return;
		this.#key = key;
		this.details = null;
		this.apps = NO_APPS;
		this.media = null;
		if (!entry || !isDesktopRuntime()) return;
		void api.fileDetails(entry.path).then((details) => this.#settle(key, () => (this.details = details)), () => undefined);
		if (!entry.is_dir) {
			void api.appsForFile(entry.path).then((apps) => this.#settle(key, () => (this.apps = apps)), () => undefined);
		}
	};

	receiveMedia = (media: MediaInfo) => {
		this.media = media;
	};

	#settle(key: string, apply: () => void) {
		if (key === this.#key) apply();
	}
}
