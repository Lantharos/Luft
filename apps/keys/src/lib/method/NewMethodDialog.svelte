<script lang="ts">
	import { Dialog, TextField } from '@luft/ui';
	import { toast } from '#lib/state/toast.svelte.js';
	import { commands } from '#lib/bindings.js';
	import type { SavedMethod } from '#lib/bindings.js';

	interface Props {
		oncreated: (method: SavedMethod) => void;
		onclose: () => void;
	}

	let { oncreated, onclose }: Props = $props();

	let name = $state('');
	let busy = $state(false);

	async function run(task: () => Promise<SavedMethod | null>) {
		if (busy) return;
		busy = true;
		try {
			const method = await task();
			if (method) oncreated(method);
		} catch (error) {
			toast.fail(error);
		} finally {
			busy = false;
		}
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && name.trim()) void run(() => commands.methodCreate({ name }));
	}
</script>

<Dialog title="New input method" {onclose}>
	<TextField label="Name" showLabel bind:value={name} placeholder="My input method" onkeydown={keydown} />
	{#snippet actions()}
		<button type="button" class="plain-button mr-auto" onclick={() => void run(() => commands.methodImport())}>Import a file</button>
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!name.trim() || busy} onclick={() => void run(() => commands.methodCreate({ name }))}>Create</button>
	{/snippet}
</Dialog>
