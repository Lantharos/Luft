<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Switch } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import ExtensionPage from './ExtensionPage.svelte';
	import { extensions } from './extensions.svelte';
	import { summary } from './status';

	void extensions.load();

	let opened = $derived(app.section ? extensions.find(app.section) : null);
</script>

{#if opened}
	<ExtensionPage extension={opened} onclose={() => (app.section = null)} />
{:else if extensions.unavailable}
	<p class="px-2 text-[13px] text-[var(--text-muted)]">{t('settings-extensions-unavailable')}</p>
{:else if extensions.list}
	<Section>
		{#each extensions.list as extension (extension.id)}
			<Row title={extension.name} description={summary(extension)} truncate onclick={() => (app.section = extension.id.toLowerCase())}>
				{#if extension.state !== 'invalid'}
					<Switch
						label={t('settings-extensions-on', { name: extension.name })}
						checked={extension.enabled}
						onchange={(on) => extensions.setEnabled(extension, on)}
					/>
				{/if}
			</Row>
		{:else}
			<Row title={t('settings-extensions-none')} />
		{/each}
	</Section>
{/if}
