import { appWindow } from '@lantharos/sabine';
import { isDesktop } from '$lib/bridge';

const IDLE_MS = 2200;
const TOAST_MS = 2600;
const SIDEBAR_KEY = 'magpie.sidebar';
const STRIP_KEY = 'magpie.strip';

export type Mode = 'viewer' | 'library';

function remembered(key: string, fallback: boolean) {
	try {
		const value = localStorage.getItem(key);
		return value === null ? fallback : value === 'true';
	} catch {
		return fallback;
	}
}

function remember(key: string, value: boolean) {
	try {
		localStorage.setItem(key, String(value));
	} catch {
		return;
	}
}

class Chrome {
	mode = $state<Mode>('library');
	sidebar = $state(true);
	strip = $state(false);
	panel = $state(false);
	details = $state(false);
	fullscreen = $state(false);
	idle = $state(false);
	watching = $state(false);
	seeThrough = $state(false);
	toast = $state<{ id: number; text: string } | null>(null);

	#idleTimer: ReturnType<typeof setTimeout> | undefined;
	#toastTimer: ReturnType<typeof setTimeout> | undefined;

	start(mode: Mode) {
		this.mode = mode;
		this.sidebar = remembered(SIDEBAR_KEY, true);
		this.strip = remembered(STRIP_KEY, false);
	}

	toggleSidebar() {
		this.sidebar = !this.sidebar;
		remember(SIDEBAR_KEY, this.sidebar);
	}

	toggleStrip() {
		this.strip = !this.strip;
		remember(STRIP_KEY, this.strip);
	}

	wake = () => {
		this.idle = false;
		clearTimeout(this.#idleTimer);
		this.#idleTimer = setTimeout(() => (this.idle = true), IDLE_MS);
	};

	setFullscreen(fullscreen: boolean) {
		if (fullscreen === this.fullscreen) return;
		this.fullscreen = fullscreen;
		if (isDesktop()) appWindow.setFullscreen(fullscreen);
		else if (fullscreen) void document.documentElement.requestFullscreen();
		else if (document.fullscreenElement) void document.exitFullscreen();
	}

	notify(text: string) {
		clearTimeout(this.#toastTimer);
		this.toast = { id: (this.toast?.id ?? 0) + 1, text };
		this.#toastTimer = setTimeout(() => (this.toast = null), TOAST_MS);
	}
}

export const chrome = new Chrome();
