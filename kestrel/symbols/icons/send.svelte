<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M15.45 2.36C15.66 1.83 15.13 1.29 14.6 1.51L1.29 5.23C0.65 5.55 0.65 6.4 1.19 6.62L6.3 8.64L10.87 5.13L7.36 9.7L9.38 14.81C9.7 15.35 10.55 15.35 10.77 14.71L15.45 2.36Z" shade="" />
