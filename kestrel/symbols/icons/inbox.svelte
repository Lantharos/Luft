<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M4.68 9.72L0 9.72L0 13.78C0 15.02 0.98 16 2.22 16L13.78 16C15.02 16 16 15.02 16 13.78L16 9.72L11.32 9.72L10.09 11.82L5.91 11.82L4.68 9.72Z" shade="M0.12 8.49L2.34 2.58C2.71 1.72 3.45 1.23 4.31 1.23L11.69 1.23C12.55 1.23 13.42 1.72 13.66 2.58L15.88 8.49L0.12 8.49Z" />
