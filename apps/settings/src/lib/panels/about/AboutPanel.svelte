<script lang="ts">
	import { Dialog, Row, Section, TextField } from '@luft/ui';
	import { binaryBytes, bytes } from '$lib/format';
	import { about, openDisks, rename, type About } from './api';
	import RecentProblems from './RecentProblems.svelte';

	let info = $state<About | null>(null);
	let renaming = $state(false);
	let draft = $state('');
	let error = $state('');

	async function load() {
		info = await about();
	}

	async function saveName() {
		try {
			await rename(draft);
			renaming = false;
			await load();
		} catch (reason) {
			error = String(reason);
		}
	}

	function startRename() {
		draft = info?.deviceName ?? '';
		error = '';
		renaming = true;
	}

	void load();
</script>

{#if info}
	<div class="flex flex-col gap-1 px-2 pb-2">
		<span class="truncate text-[26px] font-semibold">{info.deviceName}</span>
		<span class="truncate text-[14px] text-[var(--text-muted)]">{info.system}</span>
	</div>

	<Section>
		<Row title="Device name" description="How other devices see this computer">
			<span class="max-w-[220px] truncate">{info.deviceName}</span>
			<button type="button" class="button" onclick={startRename}>Rename</button>
		</Row>
	</Section>

	<Section title="Hardware">
		{#if info.processor}
			<Row title="Processor"><span class="value">{info.processor}</span></Row>
		{/if}
		{#each info.graphics as adapter, index (adapter)}
			<Row title={info.graphics.length > 1 ? `Graphics ${index + 1}` : 'Graphics'}><span class="value">{adapter}</span></Row>
		{/each}
		{#if info.memory}
			<Row title="Memory"><span>{binaryBytes(info.memory)}</span></Row>
		{/if}
		{#if info.storage}
			{@const storage = info.storage}
			<Row title="Storage" description="{bytes(storage.free)} free of {bytes(storage.total)}">
				{#if storage.manageable}
					<button type="button" class="button" onclick={openDisks}>Manage drives</button>
				{/if}
				{#snippet below()}
					<div class="h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
						<div class="h-full rounded-full bg-[var(--accent)]" style:width="{((storage.total - storage.free) / storage.total) * 100}%"></div>
					</div>
				{/snippet}
			</Row>
		{/if}
	</Section>

	<Section title="Software">
		<Row title="System"><span class="value">{info.system}</span></Row>
		<Row title="Desktop"><span class="value">Kestrel on {info.windowing}</span></Row>
		<Row title="Kernel"><span class="value">{info.kernel}</span></Row>
		<Row title="Hostname"><span class="value">{info.hostname}</span></Row>
	</Section>

	<RecentProblems />
{/if}

{#if renaming}
	<Dialog title="Rename this device" description="Other devices nearby see this name." onclose={() => (renaming = false)}>
		<TextField label="Device name" bind:value={draft} {error} live onkeydown={(event) => event.key === 'Enter' && draft.trim() && saveName()} />
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (renaming = false)}>Cancel</button>
			<button type="button" class="button primary" disabled={!draft.trim()} onclick={saveName}>Rename</button>
		{/snippet}
	</Dialog>
{/if}

<style>
	.value {
		max-width: 400px;
		overflow: hidden;
		text-align: right;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
