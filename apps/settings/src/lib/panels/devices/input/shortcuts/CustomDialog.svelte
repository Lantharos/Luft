<script lang="ts">
	import { t } from '@luft/i18n';
	import { untrack } from 'svelte';
	import { Dialog, TextField } from '@luft/ui';
	import { typesText } from './accelerator';
	import KeyCapture from './KeyCapture.svelte';
	import type { CustomBinding, ShortcutStore } from './store.svelte';

	interface Props {
		store: ShortcutStore;
		binding: CustomBinding | null;
		onclose: () => void;
	}

	let { store, binding, onclose }: Props = $props();

	const initial = untrack(() => ({ name: binding?.name ?? '', command: binding?.command ?? '', accelerator: binding?.accelerators[0] ?? '' }));

	let name = $state(initial.name);
	let command = $state(initial.command);
	let accelerator = $state(initial.accelerator);
	let recording = $state(false);
	let error = $state('');

	let self = $derived<CustomBinding>(binding ?? { kind: 'custom', id: '', name, accelerators: [], path: '', command });
	let taken = $derived(accelerator ? store.conflict(accelerator, self) : undefined);
	let ready = $derived(name.trim() && command.trim() && !recording);

	function capture(captured: string | null) {
		error = '';
		if (captured && typesText(captured)) {
			error = t('settings-shortcuts-needs-modifier');
			return;
		}
		accelerator = captured ?? '';
	}

	async function save() {
		const values = { name: name.trim(), command: command.trim(), binding: accelerator };
		try {
			if (taken) await store.release(accelerator, taken);
			if (binding) await store.updateCustom(binding, values);
			else await store.addCustom(values);
			onclose();
		} catch (reason) {
			error = String(reason);
		}
	}

	async function remove() {
		if (!binding) return;
		await store.removeCustom(binding);
		onclose();
	}
</script>

<Dialog title={binding ? t('settings-shortcuts-edit') : t('settings-shortcuts-add')} {onclose}>
	<TextField label={t('settings-shortcuts-custom-name')} showLabel bind:value={name} />
	<TextField label={t('settings-shortcuts-custom-command')} showLabel bind:value={command} />
	<div class="flex flex-col gap-1.5">
		<span class="field-label">{t('settings-shortcuts-custom-shortcut')}</span>
		<KeyCapture accelerators={accelerator ? [accelerator] : []} bind:recording oncapture={capture} />
	</div>
	{#if taken}
		<p class="text-[13px] leading-relaxed text-[var(--text-soft)]">{t('settings-shortcuts-custom-taken', { name: taken.name })}</p>
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		{#if binding}
			<button type="button" class="button danger mr-auto" onclick={remove}>{t('settings-shortcuts-remove')}</button>
		{/if}
		<button type="button" class="button" onclick={onclose}>{t('settings-shortcuts-cancel')}</button>
		<button type="button" class="button primary" disabled={!ready} onclick={save}>{binding ? t('settings-shortcuts-save') : t('settings-shortcuts-add-button')}</button>
	{/snippet}
</Dialog>

<style>
	.field-label {
		padding-inline: 4px;
		font-size: 13px;
		color: var(--text-soft);
	}
</style>
