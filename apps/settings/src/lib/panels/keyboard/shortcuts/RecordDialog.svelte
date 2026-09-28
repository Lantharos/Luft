<script lang="ts">
	import Dialog from '$lib/components/controls/Dialog.svelte';
	import { typesText } from './accelerator';
	import KeyCapture from './KeyCapture.svelte';
	import type { Binding, ShortcutStore } from './store.svelte';

	interface Props {
		store: ShortcutStore;
		binding: Binding;
		onclose: () => void;
	}

	let { store, binding, onclose }: Props = $props();

	let recording = $state(true);
	let pending = $state<string | null>(null);
	let taken = $state<Binding | null>(null);
	let error = $state('');

	async function apply(accelerators: string[]) {
		try {
			await store.assign(binding, accelerators);
			onclose();
		} catch (reason) {
			error = String(reason);
		}
	}

	function capture(accelerator: string | null) {
		error = '';
		if (accelerator === null) return apply([]);
		if (typesText(accelerator)) {
			error = 'Add Ctrl, Alt, or Super so the shortcut doesn’t get in the way of typing.';
			recording = true;
			return;
		}
		const other = store.conflict(accelerator, binding);
		if (!other) return apply([accelerator]);
		pending = accelerator;
		taken = other;
	}

	async function replace() {
		if (!pending || !taken) return;
		await store.release(pending, taken);
		await apply([pending]);
	}

	function retry() {
		pending = null;
		taken = null;
		recording = true;
	}
</script>

<Dialog title={binding.name} description="Press the new shortcut. Backspace turns it off, Escape cancels." {onclose}>
	<KeyCapture accelerators={pending ? [pending] : binding.accelerators} bind:recording oncapture={capture} oncancel={onclose} />
	{#if taken}
		<p class="text-[13px] leading-relaxed text-[var(--text-soft)]">
			This shortcut is already used for “{taken.name}”. Replacing it turns it off there.
		</p>
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		{#if taken}
			<button type="button" class="button" onclick={retry}>Try another</button>
			<button type="button" class="button primary" onclick={replace}>Replace</button>
		{:else}
			<button type="button" class="button" onclick={onclose}>Cancel</button>
		{/if}
	{/snippet}
</Dialog>
