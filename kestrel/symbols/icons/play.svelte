<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M5.93 1.56C5.13 0.98 3.97 1.56 3.97 2.59L3.97 13.41C3.97 14.44 5.13 15.01 5.93 14.44L13.98 9.03C14.79 8.57 14.79 7.43 13.98 6.97L5.93 1.56Z" shade="" />
