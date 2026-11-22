<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M4.47 0.57C4.1 -0.04 3.25 -0.16 2.64 0.21L1.42 1.91C0.57 2.52 0.21 3.49 0.45 4.47C1.42 9.58 6.42 14.58 11.78 15.55C12.75 15.79 13.72 15.43 14.33 14.58L15.43 12.99C15.92 12.38 15.67 11.53 15.06 11.17L12.14 9.46C11.53 9.1 10.8 9.22 10.31 9.71L9.34 10.8C7.27 9.83 5.81 8.37 4.83 6.29L5.93 5.32C6.42 4.83 6.54 4.1 6.17 3.49L4.47 0.57Z" shade="" />
