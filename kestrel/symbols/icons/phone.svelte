<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M4.67 0.99C4.32 0.41 3.51 0.29 2.94 0.64L1.79 2.25C0.98 2.83 0.64 3.74 0.87 4.67C1.79 9.49 6.5 14.21 11.57 15.13C12.49 15.36 13.41 15.02 13.98 14.21L15.02 12.72C15.48 12.14 15.25 11.34 14.67 10.99L11.91 9.38C11.34 9.04 10.65 9.15 10.19 9.61L9.27 10.65C7.31 9.73 5.93 8.35 5.01 6.39L6.05 5.47C6.5 5.01 6.62 4.32 6.27 3.75L4.67 0.99Z" shade="" />
