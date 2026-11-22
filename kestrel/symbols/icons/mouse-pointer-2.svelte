<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M3.22 13.61L3.22 1.43C3.22 0.84 3.94 0.48 4.42 0.96L13.61 9.07C14.09 9.55 13.73 10.27 13.13 10.27L9.43 10.27L11.34 14.33C11.58 14.81 11.46 15.28 10.99 15.52L10.27 15.88C9.79 16.12 9.31 16 9.07 15.52L7.16 11.46L4.42 14.09C3.94 14.57 3.22 14.21 3.22 13.61Z" shade="" />
