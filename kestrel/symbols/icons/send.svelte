<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M15.95 1.98C16.18 1.41 15.61 0.85 15.04 1.07L0.85 5.05C0.16 5.39 0.16 6.3 0.73 6.52L6.18 8.68L11.07 4.93L7.32 9.82L9.48 15.27C9.82 15.84 10.73 15.84 10.95 15.15L15.95 1.98Z" shade="" />
