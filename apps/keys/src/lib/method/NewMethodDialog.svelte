<script lang="ts">
	import { Dialog, TextField } from '@luft/ui';
	import { toast } from '#lib/state/toast.svelte.js';
	import { createMethod, importMethod, type Method } from './api';

	interface Props {
		oncreated: (method: Method) => void;
		onclose: () => void;
	}

	let { oncreated, onclose }: Props = $props();

	let name = $state('');
	let busy = $state(false);

	async function run(task: () => Promise<Method | null>) {
		if (busy) return;
		busy = true;
		try {
			const method = await task();
			if (method) oncreated(method);
		} catch (error) {
			toast.failed(error);
		} finally {
			busy = false;
		}
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && name.trim()) void run(() => createMethod(name));
	}
</script>

<Dialog
	title="New input method"
	description="Give it a name, then add replacements, words to choose from, or sequences. You can also bring one in from a file, including m17n and IBus table files."
	{onclose}
>
	<TextField label="Name" showLabel bind:value={name} placeholder="My input method" onkeydown={keydown} />
	{#snippet actions()}
		<button type="button" class="plain-button mr-auto" onclick={() => void run(importMethod)}>Import a file</button>
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!name.trim() || busy} onclick={() => void run(() => createMethod(name))}>Create</button>
	{/snippet}
</Dialog>
