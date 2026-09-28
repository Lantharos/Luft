import type { Component } from 'svelte';
import Bluetooth from '@lucide/svelte/icons/bluetooth';
import Camera from '@lucide/svelte/icons/camera';
import Gamepad2 from '@lucide/svelte/icons/gamepad-2';
import Headphones from '@lucide/svelte/icons/headphones';
import Keyboard from '@lucide/svelte/icons/keyboard';
import Laptop from '@lucide/svelte/icons/laptop';
import Monitor from '@lucide/svelte/icons/monitor';
import Mouse from '@lucide/svelte/icons/mouse';
import Printer from '@lucide/svelte/icons/printer';
import Smartphone from '@lucide/svelte/icons/smartphone';
import Speaker from '@lucide/svelte/icons/speaker';
import Tablet from '@lucide/svelte/icons/tablet';
import type { Kind } from './api';

export const KIND_ICONS: Record<Kind, Component> = {
	headphones: Headphones,
	speaker: Speaker,
	mouse: Mouse,
	keyboard: Keyboard,
	gamepad: Gamepad2,
	phone: Smartphone,
	computer: Laptop,
	tablet: Tablet,
	display: Monitor,
	printer: Printer,
	camera: Camera,
	other: Bluetooth
};
