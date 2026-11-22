<script lang="ts">
	import { t } from '@luft/i18n';
	import type { Component } from 'svelte';
	import BatteryMedium from '@luft/symbols/icons/battery-medium';
	import Gamepad from '@luft/symbols/icons/gamepad-2';
	import Headphones from '@luft/symbols/icons/headphones';
	import Keyboard from '@luft/symbols/icons/keyboard';
	import Mouse from '@luft/symbols/icons/mouse';
	import Pen from '@luft/symbols/icons/pen';
	import Smartphone from '@luft/symbols/icons/smartphone';
	import Speaker from '@luft/symbols/icons/speaker';
	import SquareMousePointer from '@luft/symbols/icons/square-mouse-pointer';
	import Tablet from '@luft/symbols/icons/tablet';
	import { ProgressBar, Row, Section } from '@luft/ui';
	import type { PowerDevice, PowerDeviceKind } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';

	const KINDS: Record<PowerDeviceKind, { icon: Component; label: string }> = {
		mouse: { icon: Mouse, label: 'settings-power-device-mouse' },
		keyboard: { icon: Keyboard, label: 'settings-power-device-keyboard' },
		headphones: { icon: Headphones, label: 'settings-power-device-headphones' },
		speaker: { icon: Speaker, label: 'settings-power-device-speaker' },
		gamepad: { icon: Gamepad, label: 'settings-power-device-controller' },
		phone: { icon: Smartphone, label: 'settings-power-device-phone' },
		tablet: { icon: Tablet, label: 'settings-power-device-tablet' },
		pen: { icon: Pen, label: 'settings-power-device-pen' },
		touchpad: { icon: SquareMousePointer, label: 'settings-power-device-touchpad' },
		other: { icon: BatteryMedium, label: 'settings-power-device-other' }
	};

	let { devices }: { devices: PowerDevice[] } = $props();
</script>

<Section title={t('settings-power-devices')}>
	{#each devices as device (device.id)}
		{@const kind = KINDS[device.kind]}
		<Row title={device.name ?? t(kind.label)} description={device.charging ? t('settings-power-charging') : undefined} icon={kind.icon}>
			<ProgressBar fraction={device.level / 100} class="w-16" />
			<span class="w-10 text-right tabular-nums">{percent(device.level / 100)}</span>
		</Row>
	{/each}
</Section>
