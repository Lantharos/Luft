<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M15.7 2.17C15.92 1.62 15.37 1.07 14.82 1.29L1.07 5.14C0.41 5.47 0.41 6.35 0.96 6.57L6.24 8.66L10.97 5.03L7.34 9.76L9.43 15.04C9.76 15.59 10.64 15.59 10.86 14.93L15.7 2.17Z" shade="" />
