<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M4.9 9.61L0.52 9.61L0.52 13.41C0.52 14.55 1.44 15.47 2.59 15.47L13.41 15.47C14.56 15.47 15.48 14.55 15.48 13.41L15.48 9.61L11.11 9.61L9.96 11.57L6.05 11.57L4.9 9.61Z" shade="M0.64 8.46L2.71 2.94C3.06 2.13 3.75 1.68 4.55 1.68L11.45 1.68C12.26 1.68 13.06 2.13 13.29 2.94L15.36 8.46L0.64 8.46Z" />
