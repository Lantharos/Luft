<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { Dialog, Segmented, TextField } from '@luft/ui';
	import * as features from '$lib/features/api';
	import { archiveName } from '$lib/features/archives';
	import type { ArchiveFormat } from '$lib/features/types';
	import type { FileEntry } from '$lib/types';
	import { errorMessage, plural } from '$lib/utils/format';

	interface Props {
		entries: FileEntry[];
		destination: string;
		onclose: () => void;
	}

	let { entries, destination, onclose }: Props = $props();

	const FORMATS: { value: ArchiveFormat; label: string }[] = [
		{ value: 'zip', label: 'Zip' },
		{ value: 'tar-zst', label: 'tar.zst' }
	];

	let field = $state<{ focus: () => void }>();
	let name = $state(untrack(() => archiveName(entries)));
	let format = $state<ArchiveFormat>('zip');
	let error = $state<string | null>(null);

	let hint = $derived(
		format === 'zip' ? 'Opens on any computer.' : 'Smaller and faster, for Linux and other Unix systems.'
	);
	let valid = $derived(name.trim().length > 0 && !name.includes('/'));

	$effect(() => {
		void tick().then(() => field?.focus());
	});

	async function submit() {
		if (!valid) return;
		try {
			await features.compressItems(
				entries.map((entry) => entry.path),
				destination,
				name.trim(),
				format
			);
			onclose();
		} catch (caught) {
			error = errorMessage(caught);
		}
	}
</script>

<Dialog title={`Compress ${entries.length === 1 ? `“${entries[0].name}”` : plural(entries.length, 'item')}`} {onclose}>
	<TextField
		bind:this={field}
		label="Archive name"
		placeholder="Archive name"
		bind:value={name}
		invalid={!valid}
		onkeydown={(event) => event.key === 'Enter' && void submit()}
	/>
	<div class="flex flex-col gap-2">
		<Segmented label="Format" options={FORMATS} value={format} onchange={(value) => (format = value)} />
		<p class="px-1 text-[12px] text-[var(--text-muted)]">{hint}</p>
	</div>
	{#if error}
		<p class="text-[12px] text-[var(--danger)]">{error}</p>
	{/if}

	{#snippet actions()}
		<button class="button" type="button" onclick={onclose}>Cancel</button>
		<button class="button primary" type="button" disabled={!valid} onclick={submit}>Compress</button>
	{/snippet}
</Dialog>
