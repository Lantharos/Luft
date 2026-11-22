<script lang="ts">
	import type { SymbolProps } from './props.ts';

	let { size = 24, ink, shade, ...rest }: SymbolProps & { ink: string; shade: string } = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...rest}>
	{#if shade}<path opacity="0.4" fill-rule="evenodd" d={shade} />{/if}
	<path fill-rule="evenodd" d={ink} />
</svg>
