<script lang="ts">
	import { Dialog, Row, Section } from '@luft/ui';
	import { binaryBytes, bytes } from '$lib/format';
	import { about, rename, type About } from './api';

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
		<span class="text-[26px] font-semibold">{info.deviceName}</span>
		<span class="text-[14px] text-[var(--text-muted)]">{info.system}</span>
	</div>

	<Section>
		<Row title="Device name" description="How this computer appears to other devices on the network">
			<span>{info.deviceName}</span>
			<button type="button" class="button" onclick={startRename}>Rename</button>
		</Row>
	</Section>

	<Section title="Hardware">
		{#if info.processor}
			<Row title="Processor"><span class="text-right">{info.processor}</span></Row>
		{/if}
		{#each info.graphics as adapter, index (adapter)}
			<Row title={info.graphics.length > 1 ? `Graphics ${index + 1}` : 'Graphics'}><span class="text-right">{adapter}</span></Row>
		{/each}
		{#if info.memory}
			<Row title="Memory"><span>{binaryBytes(info.memory)}</span></Row>
		{/if}
		{#if info.storage}
			{@const storage = info.storage}
			<Row title="Storage" description="{bytes(storage.free)} free of {bytes(storage.total)}">
				{#snippet below()}
					<div class="h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
						<div class="h-full rounded-full bg-[var(--accent)]" style:width="{((storage.total - storage.free) / storage.total) * 100}%"></div>
					</div>
				{/snippet}
			</Row>
		{/if}
	</Section>

	<Section title="Software">
		<Row title="System"><span>{info.system}</span></Row>
		<Row title="Desktop"><span>Kestrel on {info.windowing}</span></Row>
		<Row title="Kernel"><span>{info.kernel}</span></Row>
		<Row title="Hostname"><span>{info.hostname}</span></Row>
	</Section>
{/if}

{#if renaming}
	<Dialog title="Rename this device" description="Other devices see this name when you share files or connect over Bluetooth." onclose={() => (renaming = false)}>
		<input class="text-field" bind:value={draft} onkeydown={(event) => event.key === 'Enter' && saveName()} />
		{#if error}
			<p class="text-[13px] text-[var(--danger)]">{error}</p>
		{/if}
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (renaming = false)}>Cancel</button>
			<button type="button" class="button primary" disabled={!draft.trim()} onclick={saveName}>Rename</button>
		{/snippet}
	</Dialog>
{/if}
