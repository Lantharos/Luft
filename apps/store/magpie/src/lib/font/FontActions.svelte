<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { t } from '@luft/i18n';
	import { MenuItem } from '@luft/ui';
	import MoreMenu from '#lib/shell/MoreMenu.svelte';
	import { fontState } from './state.svelte';
</script>

{#if fontState.status === 'missing'}
	<button type="button" class="button primary mr-1" disabled={fontState.busy} onclick={() => fontState.install()}>{t('magpie-font-install')}</button>
{:else if fontState.status}
	<span class="mr-2 flex items-center gap-1.5 text-[13px] text-[var(--text-soft)]"><Check size={15} />{t('magpie-font-installed')}</span>
	{#if fontState.status === 'user'}
		<button type="button" class="button mr-1" disabled={fontState.busy} onclick={() => fontState.remove()}>{t('magpie-font-remove')}</button>
	{/if}
{/if}
<MoreMenu>
	{#snippet children(close)}
		<MenuItem
			disabled={fontState.busy}
			onclick={() => {
				close();
				void fontState.use('interface');
			}}>{t('magpie-font-use-system')}</MenuItem
		>
		{#if fontState.face?.monospace}
			<MenuItem
				disabled={fontState.busy}
				onclick={() => {
					close();
					void fontState.use('monospace');
				}}>{t('magpie-font-use-monospace')}</MenuItem
			>
		{/if}
	{/snippet}
</MoreMenu>
