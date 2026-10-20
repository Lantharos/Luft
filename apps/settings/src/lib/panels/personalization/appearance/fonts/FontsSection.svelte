<script lang="ts">
	import { t } from '@luft/i18n';
	import { appearance, Row, Section } from '@luft/ui';
	import FontPicker from './FontPicker.svelte';
	import { fontLibrary } from './library.svelte';

	interface Props {
		onbrowse: () => void;
	}

	let { onbrowse }: Props = $props();

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
	<Row title={t('settings-fonts-all')} description={t('settings-fonts-all-description')} onclick={onbrowse} />
</Section>
{#if problem}
	<p class="-mt-3 px-1.5 text-[13px] text-[var(--danger)]">{problem}</p>
{/if}
