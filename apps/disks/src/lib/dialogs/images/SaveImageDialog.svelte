<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog, TextField } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { WAIT } from '#lib/bridge/index.js';
	import { disks } from '#lib/state/disks.svelte.js';

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
		void commands.disksImageFolder().then((path) => (folder ||= path));
	});

	async function change() {
		const chosen = await commands.disksImageChooseFolder().catch((caught) => (disks.fail(caught), null));
		if (chosen) folder = chosen;
	}

	async function submit() {
		if (!valid || working) return;
		working = true;
		const done = await disks.run(block, () => commands.disksImageCreate({ block, path: `${folder.replace(/\/$/, '')}/${file.trim()}` }, WAIT));
		working = false;
		if (done) onclose();
	}
</script>

<Dialog title="Save as disk image" {onclose}>
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
