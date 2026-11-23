<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M1.06 5.75L1.06 10.25Q1.06 14.94 5.75 14.94L10.25 14.94Q14.94 14.94 14.94 10.25L14.94 5.75Q14.94 1.06 10.25 1.06L5.75 1.06Q1.06 1.06 1.06 5.75ZM5.75 12.06Q3.94 12.06 3.94 10.25L3.94 5.75Q3.94 3.94 5.75 3.94L10.25 3.94Q12.06 3.94 12.06 5.75L12.06 10.25Q12.06 12.06 10.25 12.06L5.75 12.06Z" shade="" />
