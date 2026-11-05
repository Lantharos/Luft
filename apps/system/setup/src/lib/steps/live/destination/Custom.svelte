<script lang="ts">
	import Box from '@lucide/svelte/icons/box';
	import { t } from '@luft/i18n';
	import { bytes } from '@luft/ui';
	import { openDisks } from '#lib/bridge/system.js';
	import OptionRow from '#lib/components/OptionRow.svelte';
	import { install } from '#lib/state/install.svelte.js';

	interface Props {
		selected: string | null;
		onselect: (key: string) => void;
	}

	let { selected, onselect }: Props = $props();
	let problem = $state('');

	async function open() {
		problem = '';
		await openDisks().catch((error) => (problem = String(error)));
	}
</script>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center gap-2">
		<button type="button" class="button large" onclick={open}>{t('setup-custom-open-disks')}</button>
		<button type="button" class="plain-button large" disabled={install.surveying} onclick={() => install.look()}>
			{t(install.surveying ? 'setup-custom-looking' : 'setup-custom-look-again')}
		</button>
		{#if problem}
			<span class="text-[13px] text-[var(--danger)]">{problem}</span>
		{/if}
	</div>
	<div class="flex flex-col gap-1" role="radiogroup" aria-label={t('setup-custom-free-label')}>
		{#each install.freeSpaces as { drive, space } (`${drive.block}@${space.offset}`)}
			{@const key = `${drive.block}@${space.offset}`}
			<OptionRow
				icon={Box}
				title={t('setup-custom-free-space', { size: bytes(space.size) })}
				detail={t('setup-custom-on-drive', { drive: drive.name })}
				selected={selected === key}
				onclick={() => onselect(key)}
			/>
		{:else}
			<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">
				{t('setup-custom-none', { size: bytes(install.survey?.smallestSystem ?? 0) })}
			</p>
		{/each}
	</div>
</div>
