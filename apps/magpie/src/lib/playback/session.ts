import { appWindow } from '@lantharos/sabine';
import { commands } from '#lib/bindings.js';
import type { MediaAction } from '#lib/bindings.js';

export type Playback = Parameters<typeof commands.mediaUpdate>[0];

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
		void commands.mediaClear();
	}

	update(owner: MediaOwner) {
		if (this.#owner === owner) void commands.mediaUpdate(owner.playback());
	}

	owns(owner: MediaOwner) {
		return this.#owner === owner;
	}

	receive = (action: MediaAction) => {
		if (action.action === 'raise') {
			appWindow.focus();
			return;
		}
		this.#owner?.handle(action);
	};
}

export const mediaSession = new MediaSession();
