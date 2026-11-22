<script lang="ts">
	import Building from '@luft/symbols/icons/building-2';
	import { t } from '@luft/i18n';
	import { Dialog, Row, Section } from '@luft/ui';
	import { policy } from '#lib/state/policy.svelte.js';
	import { managed } from './managed';

	let showing = $state(false);

	const name = $derived(policy.current?.organization.name ?? null);
	const decided = $derived(policy.current ? managed(policy.current) : []);
</script>

{#if name || decided.length}
	<Section>
		<Row title={name ? t('settings-about-managed', { organization: name }) : t('settings-about-managed-unnamed')} icon={Building} onclick={() => (showing = true)} />
	</Section>
{/if}

{#if showing}
	<Dialog title={name ? t('settings-about-managed-title', { organization: name }) : t('settings-about-managed-title-unnamed')} onclose={() => (showing = false)}>
		{#if decided.length}
			<ul class="flex flex-col gap-2.5 text-[14px] text-[var(--text-soft)]">
				{#each decided as line (line)}
					<li>{line}</li>
				{/each}
			</ul>
		{:else}
			<p class="text-[14px] text-[var(--text-soft)]">{t('settings-about-managed-nothing')}</p>
		{/if}
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (showing = false)}>{t('settings-about-done')}</button>
		{/snippet}
	</Dialog>
{/if}
