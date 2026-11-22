import type { Component } from 'svelte';
import Bluetooth from '@luft/symbols/icons/bluetooth';
import Camera from '@luft/symbols/icons/camera';
import Gamepad2 from '@luft/symbols/icons/gamepad-2';
import Headphones from '@luft/symbols/icons/headphones';
import Keyboard from '@luft/symbols/icons/keyboard';
import Laptop from '@luft/symbols/icons/laptop';
import Monitor from '@luft/symbols/icons/monitor';
import Mouse from '@luft/symbols/icons/mouse';
import Printer from '@luft/symbols/icons/printer';
import Smartphone from '@luft/symbols/icons/smartphone';
import Speaker from '@luft/symbols/icons/speaker';
import Tablet from '@luft/symbols/icons/tablet';
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
