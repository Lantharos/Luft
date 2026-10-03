<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog, TextField } from '@luft/ui';
	import * as api from '$lib/api';
	import { disks } from '$lib/state/disks.svelte';

	interface Props {
		block: string;
		name: string;
		onclose: () => void;
	}

	let { block, name, onclose }: Props = $props();

	let file = $state(untrack(() => `${name.replace(/[/\\]+/g, '-')}.img`));
	let folder = $state('');
	let working = $state(false);
	let valid = $derived(file.trim().length > 0 && !file.includes('/') && folder.length > 0);

	$effect(() => {
		void api.imageFolder().then((path) => (folder ||= path));
	});

	async function change() {
		const chosen = await api.chooseFolder().catch((caught) => (disks.fail(caught), null));
		if (chosen) folder = chosen;
	}

	async function submit() {
		if (!valid || working) return;
		working = true;
		const done = await disks.run(block, () => api.createImage(block, `${folder.replace(/\/$/, '')}/${file.trim()}`));
		working = false;
		if (done) onclose();
	}
</script>

<Dialog title="Save as disk image" description="Copies everything on it, byte for byte, into one file you can write back later." {onclose}>
	<TextField label="File name" showLabel bind:value={file} onkeydown={(event) => event.key === 'Enter' && submit()} />
	<div class="flex items-center justify-between gap-3 px-1">
		<div class="flex min-w-0 flex-col">
			<span class="text-[13px] text-[var(--text-soft)]">Folder</span>
			<span class="truncate text-[13px] text-[var(--text-muted)]">{folder}</span>
		</div>
		<button type="button" class="button" onclick={change}>Change…</button>
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!valid || working} onclick={submit}>Save</button>
	{/snippet}
</Dialog>
