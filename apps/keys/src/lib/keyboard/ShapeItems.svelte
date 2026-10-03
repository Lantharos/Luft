<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { MenuItem } from '@luft/ui';
	import { GEOMETRIES, type Geometry } from './geometry';

	interface Props {
		value: Geometry;
		onchange: (geometry: Geometry) => void;
		close: () => void;
	}

	let { value, onchange, close }: Props = $props();
</script>

{#each GEOMETRIES as shape (shape.value)}
	<MenuItem
		checked={value === shape.value}
		onclick={() => {
			close();
			onchange(shape.value);
		}}
	>
		<span class="flex-1">{shape.label} keyboard</span>
		{#if value === shape.value}
			<Check size={16} />
		{/if}
	</MenuItem>
{/each}
