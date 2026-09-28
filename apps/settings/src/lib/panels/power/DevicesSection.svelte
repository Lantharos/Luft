<script lang="ts">
	import type { Component } from 'svelte';
	import BatteryMedium from '@lucide/svelte/icons/battery-medium';
	import Gamepad from '@lucide/svelte/icons/gamepad-2';
	import Headphones from '@lucide/svelte/icons/headphones';
	import Keyboard from '@lucide/svelte/icons/keyboard';
	import Mouse from '@lucide/svelte/icons/mouse';
	import Pen from '@lucide/svelte/icons/pen';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import Speaker from '@lucide/svelte/icons/speaker';
	import SquareMousePointer from '@lucide/svelte/icons/square-mouse-pointer';
	import Tablet from '@lucide/svelte/icons/tablet';
	import Row from '$lib/components/controls/Row.svelte';
	import Section from '$lib/components/controls/Section.svelte';
	import type { Device, DeviceKind } from './api';
	import Level from './Level.svelte';

	const KINDS: Record<DeviceKind, { icon: Component; label: string }> = {
		mouse: { icon: Mouse, label: 'Mouse' },
		keyboard: { icon: Keyboard, label: 'Keyboard' },
		headphones: { icon: Headphones, label: 'Headphones' },
		speaker: { icon: Speaker, label: 'Speaker' },
		gamepad: { icon: Gamepad, label: 'Controller' },
		phone: { icon: Smartphone, label: 'Phone' },
		tablet: { icon: Tablet, label: 'Tablet' },
		pen: { icon: Pen, label: 'Pen' },
		touchpad: { icon: SquareMousePointer, label: 'Touchpad' },
		other: { icon: BatteryMedium, label: 'Device' }
	};

	let { devices }: { devices: Device[] } = $props();
</script>

<Section title="Devices">
	{#each devices as device (device.id)}
		{@const kind = KINDS[device.kind]}
		<Row title={device.name ?? kind.label} description={device.charging ? 'Charging' : undefined} icon={kind.icon}>
			<div class="w-16"><Level level={device.level} /></div>
			<span class="w-10 text-right tabular-nums">{Math.round(device.level)}%</span>
		</Row>
	{/each}
</Section>
