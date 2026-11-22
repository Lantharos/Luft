<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M13.3 13.3Q15.5 11.11 15.5 8Q15.5 4.89 13.3 2.7Q11.11 0.5 8 0.5Q4.89 0.5 2.7 2.7Q0.5 4.89 0.5 8Q0.5 11.11 2.7 13.3Q4.89 15.5 8 15.5Q11.11 15.5 13.3 13.3ZM11.9 4.1Q13.51 5.72 13.51 8Q13.51 10.28 11.9 11.9Q10.28 13.51 8 13.51Q5.72 13.51 4.1 11.9Q2.49 10.28 2.49 8Q2.49 5.72 4.1 4.1Q5.72 2.49 8 2.49Q10.28 2.49 11.9 4.1Z" shade="" />
