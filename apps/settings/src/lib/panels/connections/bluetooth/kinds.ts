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
import type { BluetoothDeviceKind } from '#lib/bindings.js';

export const KIND_ICONS: Record<BluetoothDeviceKind, Component> = {
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

export const KIND_LABELS: Record<BluetoothDeviceKind, string> = {
	headphones: 'settings-bluetooth-kind-headphones',
	speaker: 'settings-bluetooth-kind-speaker',
	mouse: 'settings-bluetooth-kind-mouse',
	keyboard: 'settings-bluetooth-kind-keyboard',
	gamepad: 'settings-bluetooth-kind-gamepad',
	phone: 'settings-bluetooth-kind-phone',
	computer: 'settings-bluetooth-kind-computer',
	tablet: 'settings-bluetooth-kind-tablet',
	display: 'settings-bluetooth-kind-display',
	printer: 'settings-bluetooth-kind-printer',
	camera: 'settings-bluetooth-kind-camera',
	other: 'settings-bluetooth-kind-other'
};
