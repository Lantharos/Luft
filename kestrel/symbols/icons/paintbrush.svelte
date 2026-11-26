<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M7.52 10.51L5.49 8.48C3.22 8.6 1.55 10.39 1.55 12.78C1.55 14.09 1.31 15.04 0.36 16L2.03 16C5.73 16 7.64 13.37 7.52 10.51Z" shade="M15.04 0C15.64 0.48 15.64 1.31 15.16 1.91L8.72 9.43L6.57 7.28L14.09 0.84C14.45 0.48 14.81 0.24 15.04 0Z" />
