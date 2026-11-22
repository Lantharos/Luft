<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M2.13 9.03L8 14.67L13.87 9.03C15.47 7.43 15.47 4.78 13.87 3.29C12.26 1.79 9.73 1.79 8.12 3.4L8 3.51L7.89 3.4C6.27 1.79 3.75 1.79 2.13 3.29C0.52 4.78 0.52 7.43 2.13 9.03Z" shade="" />
