<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M1.63 9.13L8 15.25L14.38 9.13C16.13 7.38 16.13 4.5 14.38 2.88C12.63 1.25 9.88 1.25 8.13 3L8 3.13L7.88 3C6.13 1.25 3.38 1.25 1.63 2.88C-0.12 4.5 -0.12 7.38 1.63 9.13Z" shade="" />
