<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M14.42 2.37L8.2 0.04Q8.1 0 8 0Q7.9 0 7.8 0.04L1.58 2.37Q1.5 2.4 1.44 2.45Q1.37 2.5 1.32 2.57Q1.27 2.64 1.25 2.72Q1.22 2.8 1.22 2.89L1.22 7.56Q1.22 13.5 7.8 15.96Q7.9 16 8 16Q8.1 16 8.2 15.96Q14.78 13.5 14.78 7.56L14.78 2.89Q14.78 2.8 14.75 2.72Q14.73 2.64 14.68 2.57Q14.63 2.5 14.56 2.45Q14.5 2.4 14.42 2.37Z" shade="" />
