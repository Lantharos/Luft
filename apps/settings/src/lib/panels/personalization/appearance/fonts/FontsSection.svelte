<script lang="ts">
	import { t } from '@luft/i18n';
	import { appearance, Row, Section, Slider } from '@luft/ui';
	import { percent } from '#lib/format.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import FontPicker from './FontPicker.svelte';
	import { fontLibrary } from './library.svelte';

	interface Props {
		onbrowse: () => void;
	}

	let { onbrowse }: Props = $props();

	const desktop = useSettings<{ 'text-scaling-factor': number }>('org.gnome.desktop.interface', ['text-scaling-factor']);

	let problem = $state('');

	void fontLibrary.load();
</script>

<Section title={t('settings-fonts')}>
	<Row title={t('settings-fonts-interface')} description={t('settings-fonts-interface-description')}>
		<FontPicker role="interface" label={t('settings-fonts-interface-label')} family={appearance.typography.interface ?? fontLibrary.defaults?.interface ?? ''} onerror={(message) => (problem = message)} />
	</Row>
	<Row title={t('settings-fonts-monospace')} description={t('settings-fonts-monospace-description')}>
		<FontPicker role="monospace" label={t('settings-fonts-monospace-label')} family={appearance.typography.monospace ?? fontLibrary.defaults?.monospace ?? ''} onerror={(message) => (problem = message)} />
	</Row>
	<Row title={t('settings-appearance-text-size')} description={t('settings-appearance-text-size-description')}>
		<span class="w-12 text-right tabular-nums">{percent(desktop.values['text-scaling-factor'] ?? 1)}</span>
		{#snippet below()}
			<Slider
				label={t('settings-appearance-text-size')}
				min={0.8}
				max={1.6}
				step={0.05}
				value={desktop.values['text-scaling-factor'] ?? 1}
				format={percent}
				onchange={(value) => desktop.set('text-scaling-factor', value)}
			/>
		{/snippet}
	</Row>
	<Row title={t('settings-fonts-all')} description={t('settings-fonts-all-description')} onclick={onbrowse} />
</Section>
{#if problem}
	<p class="-mt-3 px-1.5 text-[13px] text-[var(--danger)]">{problem}</p>
{/if}
