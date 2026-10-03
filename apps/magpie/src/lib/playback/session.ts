import { appWindow } from '@lantharos/sabine';
import type { MediaAction, Playback } from '#lib/api.js';
import * as api from '#lib/api.js';
import { isDesktop } from '#lib/bridge.js';

export interface MediaOwner {
	playback(): Playback;
	handle(action: MediaAction): void;
}

class MediaSession {
	#owner: MediaOwner | null = null;

	claim(owner: MediaOwner) {
		this.#owner = owner;
		this.update(owner);
	}

	release(owner: MediaOwner) {
		if (this.#owner !== owner) return;
		this.#owner = null;
		void api.mediaClear();
	}

	update(owner: MediaOwner) {
		if (this.#owner === owner) void api.mediaUpdate(owner.playback());
	}

	owns(owner: MediaOwner) {
		return this.#owner === owner;
	}

	receive = (action: MediaAction) => {
		if (action.action === 'raise') {
			if (isDesktop()) appWindow.focus();
			return;
		}
		this.#owner?.handle(action);
	};
}

export const mediaSession = new MediaSession();
