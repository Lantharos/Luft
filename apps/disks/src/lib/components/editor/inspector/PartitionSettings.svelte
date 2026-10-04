<script lang="ts">
	import { tick } from 'svelte';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import { Popover, Select, Switch, TextField, tooltip } from '@luft/ui';
	import { renamePartition, retype, setFlag } from '#lib/editor/edits.js';
	import type { Layout, Part } from '#lib/editor/model.js';
	import { FLAGS, typeFor, typeOptions } from '#lib/partitions/types.js';

	interface Props {
		layout: Layout;
		part: Part;
	}

	let { layout, part }: Props = $props();

	let button = $state<HTMLButtonElement>();
	let open = $state(false);
	let name = $state('');

	$effect.pre(() => {
		name = part.name;
	});

	let type = $derived(part.type || typeFor(layout.table, part.filesystem));
	let types = $derived(typeOptions(layout.table, type));

	function focusFirst(node: HTMLElement) {
		void tick().then(() => node.querySelector<HTMLElement>('button, input')?.focus());
	}

	function close() {
		renamePartition(part, name);
		open = false;
	}
</script>

<button
	bind:this={button}
	type="button"
	class="icon-button"
	aria-label="Partition settings"
	aria-haspopup="dialog"
	aria-expanded={open}
	{@attach tooltip('Partition settings')}
	onclick={() => (open ? close() : (open = true))}
>
	<SlidersHorizontal size={17} />
</button>

{#if open && button}
	<Popover anchor={button} label="Partition settings" role="dialog" align="end" minWidth={380} maxHeight={460} onclose={close}>
		<div class="contents" {@attach focusFirst}>
			<div class="setting">
				<span>Type</span>
				<Select label="Partition type" options={types} value={type} onchange={(value) => retype(part, value)} />
			</div>
			{#if layout.table === 'gpt'}
				<div class="setting">
					<span>Name in the table</span>
					<div class="w-[160px]" onfocusout={() => renamePartition(part, name)}>
						<TextField label="Partition name" placeholder="None" bind:value={name} onkeydown={(event) => event.key === 'Enter' && renamePartition(part, name)} />
					</div>
				</div>
			{/if}
			{#each FLAGS[layout.table] as flag (flag.bit)}
				<div class="setting">
					<span {@attach tooltip(flag.description)}>{flag.label}</span>
					<Switch label={flag.label} checked={part.flags.includes(flag.bit)} onchange={(on) => setFlag(part, flag.bit, on)} />
				</div>
			{/each}
		</div>
	</Popover>
{/if}

<style>
	.setting {
		display: flex;
		min-height: 44px;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 0 6px 0 10px;
		font-size: 13px;
		white-space: nowrap;
	}
</style>
