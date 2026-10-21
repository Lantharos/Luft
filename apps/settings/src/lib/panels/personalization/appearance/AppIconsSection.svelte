<script lang="ts">
	import { t } from '@luft/i18n';
	import { AppIcon, appearance, Row, Section, type AppIconStyle } from '@luft/ui';
	import Swatches from '#lib/components/Swatches.svelte';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
	import { installedApps, type App } from '../../protection/apps/api';

	type Kestrel = {
		'app-icon-style': AppIconStyle;
		'app-icon-tint': string;
		'favorite-apps': string[];
	};

	const PREVIEW_COUNT = 4;
	const STYLES: { value: AppIconStyle; label: string }[] = [
		{ value: 'default', label: 'settings-appearance-icons-original' },
		{ value: 'tinted', label: 'settings-appearance-icons-tinted' },
		{ value: 'clear', label: 'settings-appearance-icons-clear' }
	];
	const TINTS = [
		{ value: '#3584e4', label: 'settings-appearance-tint-blue' },
		{ value: '#2190a4', label: 'settings-appearance-tint-teal' },
		{ value: '#3a944a', label: 'settings-appearance-tint-green' },
		{ value: '#c88800', label: 'settings-appearance-tint-yellow' },
		{ value: '#ed5b00', label: 'settings-appearance-tint-orange' },
		{ value: '#e62d42', label: 'settings-appearance-tint-red' },
		{ value: '#d56199', label: 'settings-appearance-tint-pink' },
		{ value: '#9141ac', label: 'settings-appearance-tint-purple' },
		{ value: '#6f8396', label: 'settings-appearance-tint-slate' }
	];

	const kestrel = useSettings<Kestrel>(KESTREL_SCHEMA, ['app-icon-style', 'app-icon-tint', 'favorite-apps']);

	let installed = $state<App[]>([]);
	let style = $derived(kestrel.values['app-icon-style'] ?? 'tinted');
	let tint = $derived(kestrel.values['app-icon-tint'] ?? '');
	let tints = $derived([
		{ value: '', label: t('settings-appearance-accent'), color: appearance.accent ?? 'var(--accent)' },
		...TINTS.map((tint) => ({ value: tint.value, label: t(tint.label), color: tint.value }))
	]);
	let preview = $derived.by(() => {
		const byId = new Map(installed.map((app) => [app.id, app]));
		const favorites = (kestrel.values['favorite-apps'] ?? []).map((id) => byId.get(id)).filter((app) => app !== undefined);
		return [...new Set([...favorites, ...installed])].slice(0, PREVIEW_COUNT);
	});

	$effect(() => {
		installedApps().then((apps) => (installed = apps));
	});
</script>

<Section title={t('settings-appearance-icons')}>
	<div class="grid grid-cols-3 gap-3 px-4 py-3.5">
		{#each STYLES as option (option.value)}
			<button type="button" class="choice" class:selected={style === option.value} aria-pressed={style === option.value} onclick={() => kestrel.set('app-icon-style', option.value)}>
				<span class="icons">
					{#each preview as app (app.id)}
						<AppIcon icon={app.icon} id={app.id} size={30} style={option.value} />
					{/each}
				</span>
				<span class="text-sm">{t(option.label)}</span>
			</button>
		{/each}
	</div>
	{#if style === 'tinted'}
		<Row title={t('settings-appearance-tint')} description={t('settings-appearance-tint-description')}>
			<Swatches label={t('settings-appearance-tint')} options={tints} value={tint} onchange={(value) => kestrel.set('app-icon-tint', value)} />
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
		transition: transform var(--motion-tap) var(--ease-decelerate), box-shadow var(--motion-tap) var(--ease-decelerate);
	}

	.choice:hover {
		box-shadow: 0 0 0 2px var(--content), 0 0 0 4px var(--hairline);
	}

	.choice:active {
		transform: scale(0.98);
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
