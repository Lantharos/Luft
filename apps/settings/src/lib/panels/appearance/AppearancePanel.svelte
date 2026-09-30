<script lang="ts">
	import { Row, Section, Slider, Switch } from '@luft/ui';
	import { percent } from '$lib/format';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import AppIconsSection from './AppIconsSection.svelte';
	import CursorSection from './cursors/CursorSection.svelte';
	import CursorStore from './cursors/CursorStore.svelte';
	import StyleSection from './StyleSection.svelte';
	import WallpaperSection from './WallpaperSection.svelte';

	type Interface = {
		'text-scaling-factor': number;
		'enable-animations': boolean;
	};

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['text-scaling-factor', 'enable-animations']);

	let browsing = $state(false);
</script>

{#if browsing}
	<CursorStore onclose={() => (browsing = false)} />
{:else}
	<StyleSection />

	<WallpaperSection />

	<AppIconsSection />

	<CursorSection onbrowse={() => (browsing = true)} />

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
	</Section>
{/if}
