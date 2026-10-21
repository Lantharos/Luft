<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		fraction: number | null;
		label?: string;
		class?: ClassValue;
	}

	let { fraction, label, class: className }: Props = $props();
</script>

<div
	class={['progress-bar', className]}
	role="progressbar"
	aria-label={label}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={fraction === null ? undefined : Math.round(fraction * 100)}
>
	<span class:indeterminate={fraction === null} style:--progress={fraction}></span>
</div>
