<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog } from '@luft/ui';
	import type { MoveDestination } from '#lib/bindings.js';
	import TypedName from '../format/TypedName.svelte';

	interface Props {
		destination: MoveDestination;
		onback: () => void;
		onerase: () => void;
	}

	let { destination, onback, onerase }: Props = $props();

	let guarded = $derived(destination.kind !== 'usb' && destination.kind !== 'card');
	let typed = $state(false);
</script>

<Dialog title={t('disks-move-erase-title', { name: destination.name })} wide onclose={onback}>
	{#if destination.erase.contents.length}
		<p class="text-[13.5px] leading-relaxed">{t('disks-remove-deleted-files')}</p>
		<ul class="row-group">
			{#each destination.erase.contents as part (part.name)}
				<li class="line">
					<span class="min-w-0 flex-1 truncate">{part.name}</span>
					<span class="text-[13px] text-[var(--text-muted)] tabular-nums">{bytes(part.size)}</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-[13.5px] leading-relaxed">{t('disks-move-erase-unreadable')}</p>
	{/if}
	<p class="text-[13.5px] leading-relaxed">{t('disks-move-erase-then', { size: bytes(destination.erase.luft) })}</p>

	{#if guarded}
		<TypedName name={destination.name} bind:matches={typed} />
	{/if}

	{#snippet actions()}
		<button type="button" class="button" onclick={onback}>{t('disks-back')}</button>
		<button type="button" class="button danger" disabled={guarded && !typed} onclick={onerase}>{t('disks-move-erase-action')}</button>
	{/snippet}
</Dialog>

<style>
	.line {
		display: flex;
		min-height: 42px;
		align-items: center;
		gap: 12px;
		padding: 0 16px;
		font-size: 13.5px;
	}
</style>
