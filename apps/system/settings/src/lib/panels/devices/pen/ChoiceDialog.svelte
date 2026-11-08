<script lang="ts">
	import { t } from '@luft/i18n';
	import Check from '@lucide/svelte/icons/check';
	import { Dialog } from '@luft/ui';
	import KeyCapture from '../input/shortcuts/keys/KeyCapture.svelte';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		title: string;
		description?: string;
		options: Option[];
		current: string;
		keys: string;
		onchoose: (value: string, keys: string) => void;
		onclose: () => void;
	}

	let { title, description = t('settings-pen-action-description'), options, current, keys, onchoose, onclose }: Props = $props();

	let capturing = $state(false);
	let recording = $state(true);

	function pick(value: string) {
		if (value === 'keybinding') capturing = true;
		else onchoose(value, keys);
	}

	function capture(accelerator: string | null) {
		if (accelerator) onchoose('keybinding', accelerator);
		else recording = true;
	}
</script>

<Dialog {title} description={capturing ? t('settings-pen-keys-description') : description} {onclose}>
	{#if capturing}
		<KeyCapture accelerators={current === 'keybinding' && keys ? [keys] : []} bind:recording oncapture={capture} oncancel={() => (capturing = false)} />
	{:else}
		<div class="list" role="radiogroup" aria-label={title}>
			{#each options as option (option.value)}
				<button type="button" role="radio" aria-checked={option.value === current} class="option" class:chosen={option.value === current} onclick={() => pick(option.value)}>
					<span class="flex-1 truncate">{option.label}</span>
					{#if option.value === current}
						<Check size={18} class="flex-none text-[var(--accent)]" />
					{/if}
				</button>
			{/each}
		</div>
	{/if}
	{#snippet actions()}
		{#if capturing}
			<button type="button" class="button" onclick={() => (capturing = false)}>{t('settings-pen-back')}</button>
		{:else}
			<button type="button" class="button" onclick={onclose}>{t('settings-pen-cancel')}</button>
		{/if}
	{/snippet}
</Dialog>

<style>
	.list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-inline: -6px;
	}

	.option {
		display: flex;
		min-height: 42px;
		align-items: center;
		gap: 12px;
		border-radius: 12px;
		padding-inline: 10px;
		text-align: left;
		font-size: 13.5px;
		color: var(--text-soft);
		transition: background-color var(--motion-tap) var(--ease-decelerate), color var(--motion-tap) var(--ease-decelerate);
	}

	.option:hover,
	.option.chosen {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
