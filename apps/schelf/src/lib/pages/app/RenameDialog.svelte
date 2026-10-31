<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog, errorText, TextField } from '@luft/ui';
	import { commands, type Names } from '#lib/bindings.js';

	let { desktop, names, onclose }: { desktop: string; names: Names; onclose: (renamed: boolean) => void } = $props();

	let name = $state(untrack(() => names.custom ?? names.own));
	let busy = $state(false);
	let error = $state('');

	async function save() {
		busy = true;
		error = '';
		try {
			await commands.libraryRename({ desktop, name: name.trim() === names.own ? '' : name });
			onclose(true);
		} catch (reason) {
			error = errorText(reason);
			busy = false;
		}
	}
</script>

<Dialog title="Rename {names.custom ?? names.own}" description="The new name shows everywhere the app appears, such as Start and the taskbar. Leave it empty to use “{names.own}” again." onclose={() => onclose(false)}>
	<TextField label="Name" bind:value={name} placeholder={names.own} {error} live disabled={busy} onkeydown={(event) => event.key === 'Enter' && save()} />
	{#snippet actions()}
		<button type="button" class="button" onclick={() => onclose(false)}>Cancel</button>
		<button type="button" class="button primary" disabled={busy} onclick={save}>Rename</button>
	{/snippet}
</Dialog>
