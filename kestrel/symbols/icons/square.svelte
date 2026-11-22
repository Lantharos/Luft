<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M1.68 5.01L1.68 10.99Q1.68 12.37 2.65 13.35Q3.63 14.33 5.01 14.33L10.99 14.33Q14.33 14.33 14.33 10.99L14.33 5.01Q14.33 1.68 10.99 1.68L5.01 1.68Q3.63 1.68 2.65 2.65Q1.68 3.63 1.68 5.01ZM5.01 12.26Q3.75 12.26 3.75 10.99L3.75 5.01Q3.75 3.75 5.01 3.75L10.99 3.75Q12.26 3.75 12.26 5.01L12.26 10.99Q12.26 12.26 10.99 12.26L5.01 12.26Z" shade="" />
