<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M14.22 2.54L8.19 0.28Q8.1 0.25 8 0.25Q7.9 0.25 7.81 0.28L1.78 2.54Q1.71 2.57 1.64 2.62Q1.58 2.67 1.53 2.74Q1.48 2.81 1.46 2.89Q1.43 2.97 1.43 3.05L1.43 7.57Q1.43 13.32 7.81 15.72Q7.9 15.75 8 15.75Q8.1 15.75 8.19 15.72Q14.57 13.32 14.57 7.57L14.57 3.05Q14.57 2.97 14.54 2.89Q14.52 2.81 14.47 2.74Q14.42 2.67 14.36 2.62Q14.29 2.57 14.22 2.54Z" shade="" />
