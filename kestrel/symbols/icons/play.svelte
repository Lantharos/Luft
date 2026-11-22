<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M5.75 1C4.88 0.38 3.63 1 3.63 2.13L3.63 13.88C3.63 15 4.88 15.63 5.75 15L14.5 9.13C15.38 8.63 15.38 7.38 14.5 6.88L5.75 1Z" shade="" />
