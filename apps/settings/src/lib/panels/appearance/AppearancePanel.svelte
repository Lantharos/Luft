<script lang="ts">
	import { Row, Section, Slider, Switch } from '@luft/ui';
	import { percent } from '#lib/format.js';
	import { app } from '#lib/state/app.svelte.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import AppIconsSection from './AppIconsSection.svelte';
	import CursorSection from './cursors/CursorSection.svelte';
	import CursorStore from './cursors/CursorStore.svelte';
	import FontsPage from './fonts/FontsPage.svelte';
	import FontsSection from './fonts/FontsSection.svelte';
	import StyleSection from './StyleSection.svelte';
	import WallpaperSection from './WallpaperSection.svelte';

	type Interface = {
		'text-scaling-factor': number;
		'enable-animations': boolean;
	};

	const desktop = useSettings<Interface>('org.gnome.desktop.interface', ['text-scaling-factor', 'enable-animations']);

	const close = () => (app.section = null);
</script>

{#if app.section === 'cursors'}
	<CursorStore onclose={close} />
{:else if app.section === 'fonts'}
	<FontsPage onclose={close} />
{:else}
	<StyleSection />

	<WallpaperSection />

	<AppIconsSection />

	<CursorSection onbrowse={() => (app.section = 'cursors')} />

	<FontsSection onbrowse={() => (app.section = 'fonts')} />

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
		<Row title="Animations" description="Windows and menus move instead of appearing instantly">
			<Switch label="Animations" checked={desktop.values['enable-animations'] ?? true} onchange={(on) => desktop.set('enable-animations', on)} />
		</Row>
	</Section>
{/if}
