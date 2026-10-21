<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { keysInstalled, openKeys } from './api';

	const inputSources = useSettings<{ sources: [string, string][] }>('org.gnome.desktop.input-sources', ['sources']);

	let keys = $state(false);

	let firstLayout = $derived((inputSources.values.sources ?? []).find(([type]) => type === 'xkb')?.[1] ?? 'us');

	void keysInstalled().then((installed) => (keys = installed));
</script>

{#if keys}
	<Section title={t('settings-keyboard-own')}>
		<Row title={t('settings-keyboard-own-layout')} description={t('settings-keyboard-own-layout-description')} onclick={() => void openKeys(`kestrel-keys:layout/new?from=${encodeURIComponent(firstLayout)}`)} />
		<Row title={t('settings-keyboard-own-method')} description={t('settings-keyboard-own-method-description')} onclick={() => void openKeys('kestrel-keys:method/new')} />
		<Row title={t('settings-keyboard-own-open')} description={t('settings-keyboard-own-open-description')} onclick={() => void openKeys('kestrel-keys:')} />
	</Section>
{/if}
