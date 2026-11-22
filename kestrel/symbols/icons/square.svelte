<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M1.13 4.75L1.13 11.25Q1.13 12.75 2.19 13.81Q3.25 14.88 4.75 14.88L11.25 14.88Q14.88 14.88 14.88 11.25L14.88 4.75Q14.88 1.13 11.25 1.13L4.75 1.13Q3.25 1.13 2.19 2.19Q1.13 3.25 1.13 4.75ZM4.75 12.63Q3.38 12.63 3.38 11.25L3.38 4.75Q3.38 3.38 4.75 3.38L11.25 3.38Q12.63 3.38 12.63 4.75L12.63 11.25Q12.63 12.63 11.25 12.63L4.75 12.63Z" shade="" />
