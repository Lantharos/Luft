<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Align } from './placement';
	import Popover from './Popover.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		label: string;
		align?: Align;
		minWidth?: number;
		maxHeight?: number;
		trigger: Snippet<[boolean]>;
		children: Snippet<[() => void]>;
	}

	let { label, align = 'start', minWidth = 196, maxHeight = 420, trigger, children, ...rest }: Props = $props();

	let button = $state<HTMLButtonElement>();
	let open = $state(false);

	const close = () => (open = false);
</script>

<button
	bind:this={button}
	type="button"
	aria-label={label}
	aria-haspopup="menu"
	aria-expanded={open}
	{...rest}
	onclick={() => (open = !open)}
>
	{@render trigger(open)}
</button>

{#if open && button}
	<Popover anchor={button} {label} role="menu" {align} {minWidth} {maxHeight} onclose={close}>
		{@render children(close)}
	</Popover>
{/if}
