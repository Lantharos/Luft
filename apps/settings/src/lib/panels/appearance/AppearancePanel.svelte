<script lang="ts">
	import { Row, Section, Select, Slider, Switch } from '@luft/ui';
	import { percent } from '$lib/format';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import AppIconsSection from './AppIconsSection.svelte';
	import StyleSection from './StyleSection.svelte';
	import WallpaperSection from './WallpaperSection.svelte';

	type Interface = {
		'text-scaling-factor': number;
		'enable-animations': boolean;
		'cursor-size': number;
	};

	const CURSOR_SIZES = [
		{ value: 24, label: 'Default' },
		{ value: 32, label: 'Medium' },
		{ value: 48, label: 'Large' },
		{ value: 64, label: 'Larger' },
		{ value: 96, label: 'Largest' }
	];

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['text-scaling-factor', 'enable-animations', 'cursor-size']);
</script>

<StyleSection />

<WallpaperSection />

<AppIconsSection />

<Section title="Text and motion">
	<Row title="Text size" description="Makes text larger or smaller across apps">
		<span class="w-12 text-right tabular-nums">{percent(desktop.values['text-scaling-factor'] ?? 1)}</span>
		{#snippet below()}
			<Slider
				label="Text size"
				min={0.8}
				max={1.6}
				step={0.05}
				value={desktop.values['text-scaling-factor'] ?? 1}
				format={percent}
				onchange={(value) => desktop.set('text-scaling-factor', value)}
			/>
		{/snippet}
	</Row>
	<Row title="Animations" description="Windows, menus, and panels move instead of appearing instantly">
		<Switch label="Animations" checked={desktop.values['enable-animations'] ?? true} onchange={(on) => desktop.set('enable-animations', on)} />
	</Row>
	<Row title="Pointer size">
		<Select label="Pointer size" options={CURSOR_SIZES} value={desktop.values['cursor-size'] ?? 24} onchange={(size) => desktop.set('cursor-size', size)} />
	</Row>
</Section>

