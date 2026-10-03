<script lang="ts">
	import { AppIcon, appearance, Row, Section, type AppIconStyle } from '@luft/ui';
	import Swatches from '#lib/components/Swatches.svelte';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { installedApps, type App } from '../apps/api';

	type Kestrel = {
		'app-icon-style': AppIconStyle;
		'app-icon-tint': string;
		'favorite-apps': string[];
	};

	const PREVIEW_COUNT = 4;
	const STYLES: { value: AppIconStyle; label: string }[] = [
		{ value: 'default', label: 'Default' },
		{ value: 'tinted', label: 'Tinted' },
		{ value: 'clear', label: 'Clear' }
	];
	const TINTS = [
		{ value: '#3584e4', label: 'Blue' },
		{ value: '#2190a4', label: 'Teal' },
		{ value: '#3a944a', label: 'Green' },
		{ value: '#c88800', label: 'Yellow' },
		{ value: '#ed5b00', label: 'Orange' },
		{ value: '#e62d42', label: 'Red' },
		{ value: '#d56199', label: 'Pink' },
		{ value: '#9141ac', label: 'Purple' },
		{ value: '#6f8396', label: 'Slate' }
	].map((tint) => ({ ...tint, color: tint.value }));

	const kestrel = useSettings<Kestrel>('com.lantharos.kestrel', ['app-icon-style', 'app-icon-tint', 'favorite-apps']);

	let installed = $state<App[]>([]);
	let style = $derived(kestrel.values['app-icon-style'] ?? 'default');
	let tint = $derived(kestrel.values['app-icon-tint'] ?? '');
	let tints = $derived([{ value: '', label: 'Accent color', color: appearance.accent ?? 'var(--accent)' }, ...TINTS]);
	let preview = $derived.by(() => {
		const byId = new Map(installed.map((app) => [app.id, app]));
		const favorites = (kestrel.values['favorite-apps'] ?? []).map((id) => byId.get(id)).filter((app) => app !== undefined);
		return [...new Set([...favorites, ...installed])].slice(0, PREVIEW_COUNT);
	});

	$effect(() => {
		installedApps().then((apps) => (installed = apps));
	});
</script>

<Section title="App icons">
	<div class="grid grid-cols-3 gap-3 px-4 py-3.5">
		{#each STYLES as option (option.value)}
			<button type="button" class="choice" class:selected={style === option.value} aria-pressed={style === option.value} onclick={() => kestrel.set('app-icon-style', option.value)}>
				<span class="icons">
					{#each preview as app (app.id)}
						<AppIcon icon={app.icon} id={app.id} size={30} style={option.value} />
					{/each}
				</span>
				<span class="text-sm">{option.label}</span>
			</button>
		{/each}
	</div>
	{#if style === 'tinted'}
		<Row title="Tint" description="The first color follows your accent color">
			<Swatches label="Tint" options={tints} value={tint} onchange={(value) => kestrel.set('app-icon-tint', value)} />
		</Row>
	{/if}
</Section>

<style>
	.choice {
		display: grid;
		justify-items: center;
		gap: 10px;
		border-radius: 14px;
		padding: 14px 8px 10px;
		transition: transform 180ms var(--ease), box-shadow 180ms var(--ease);
	}

	.choice:hover {
		transform: scale(1.02);
	}

	.choice.selected {
		box-shadow: 0 0 0 2px var(--content), 0 0 0 4px var(--accent);
	}

	.icons {
		display: flex;
		gap: 8px;
		border-radius: 12px;
		padding: 10px 12px;
		background: #181817;
	}
</style>
