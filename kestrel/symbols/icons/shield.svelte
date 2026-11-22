<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M14.02 2.72L8.18 0.53Q8.09 0.5 8 0.5Q7.91 0.5 7.82 0.53L1.98 2.72Q1.91 2.75 1.85 2.8Q1.78 2.85 1.74 2.91Q1.69 2.98 1.67 3.05Q1.65 3.13 1.65 3.21L1.65 7.58Q1.65 13.15 7.82 15.47Q7.91 15.5 8 15.5Q8.09 15.5 8.18 15.47Q14.35 13.15 14.35 7.58L14.35 3.21Q14.35 3.13 14.33 3.05Q14.31 2.98 14.26 2.91Q14.22 2.85 14.15 2.8Q14.09 2.75 14.02 2.72Z" shade="" />
