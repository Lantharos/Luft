<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M13.5 0.25L2.5 0.25C1.25 0.25 0.25 1.25 0.25 2.5L0.25 13.5C0.25 14.75 1.25 15.75 2.5 15.75L9.5 15.75L9.5 11.75C9.5 10.5 10.5 9.5 11.75 9.5L15.75 9.5L15.75 2.5C15.75 1.25 14.75 0.25 13.5 0.25Z" shade="M11 12.25L11 15.63L15.63 11L12.25 11C11.5 11 11 11.63 11 12.25Z" />
