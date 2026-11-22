<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M3.52 13.26L3.52 1.84C3.52 1.28 4.19 0.95 4.64 1.4L13.26 9.01C13.71 9.46 13.37 10.13 12.81 10.13L9.34 10.13L11.13 13.93C11.36 14.38 11.25 14.83 10.8 15.05L10.13 15.39C9.68 15.61 9.23 15.5 9.01 15.05L7.22 11.25L4.64 13.71C4.19 14.16 3.52 13.82 3.52 13.26Z" shade="" />
