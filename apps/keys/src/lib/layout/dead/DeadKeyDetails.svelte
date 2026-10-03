<script lang="ts">
	import PenLine from '@lucide/svelte/icons/pen-line';
	import { Popover, TextField, tooltip } from '@luft/ui';
	import type { DeadKey } from '../api';
	import type { LayoutEditor } from '../editor.svelte';

	interface Props {
		editor: LayoutEditor;
		key: DeadKey;
	}

	let { editor, key }: Props = $props();

	let button = $state<HTMLButtonElement>();
	let open = $state(false);
	let name = $state<TextField>();

	$effect(() => {
		if (open && name) requestAnimationFrame(() => name?.focus());
	});
</script>

<button bind:this={button} type="button" class="icon-button" aria-label="Edit details" aria-expanded={open} {@attach tooltip('Edit details')} onclick={() => (open = !open)}>
	<PenLine size={17} />
</button>

{#if open && button}
	<Popover anchor={button} label="Details of {key.name}" role="dialog" align="end" minWidth={320} maxHeight={360} onclose={() => (open = false)}>
		<div class="flex flex-col gap-3 p-2.5" data-own-undo>
			<TextField bind:this={name} label="Name" showLabel bind:value={() => key.name, (value) => editor.updateDead(key.keysym, 'name', value)} />
			<div class="grid grid-cols-2 gap-3">
				<TextField label="On the key" showLabel bind:value={() => key.symbol, (value) => editor.updateDead(key.keysym, 'symbol', value)} />
				<TextField label="With Space" showLabel bind:value={() => key.spacing, (value) => editor.updateDead(key.keysym, 'spacing', value)} />
			</div>
		</div>
	</Popover>
{/if}
