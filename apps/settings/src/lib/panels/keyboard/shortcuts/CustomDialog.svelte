<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog } from '@luft/ui';
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
			error = 'Add Ctrl, Alt, or Super so the shortcut doesn’t get in the way of typing.';
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

<Dialog title={binding ? 'Edit shortcut' : 'Add shortcut'} {onclose}>
	<label class="flex flex-col gap-1.5">
		<span class="field-label">Name</span>
		<input class="text-field" bind:value={name} />
	</label>
	<label class="flex flex-col gap-1.5">
		<span class="field-label">Command</span>
		<input class="text-field" bind:value={command} spellcheck="false" />
	</label>
	<div class="flex flex-col gap-1.5">
		<span class="field-label">Shortcut</span>
		<KeyCapture accelerators={accelerator ? [accelerator] : []} bind:recording oncapture={capture} />
	</div>
	{#if taken}
		<p class="text-[13px] leading-relaxed text-[var(--text-soft)]">Already used for “{taken.name}”. Saving turns it off there.</p>
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		{#if binding}
			<button type="button" class="button danger mr-auto" onclick={remove}>Remove</button>
		{/if}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!ready} onclick={save}>{binding ? 'Save' : 'Add'}</button>
	{/snippet}
</Dialog>

<style>
	.field-label {
		padding-left: 4px;
		font-size: 12.5px;
		font-weight: 500;
		color: var(--text-muted);
	}
</style>
