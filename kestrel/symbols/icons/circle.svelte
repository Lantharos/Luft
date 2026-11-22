<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M13.48 13.48Q15.75 11.21 15.75 8Q15.75 4.79 13.48 2.52Q11.21 0.25 8 0.25Q4.79 0.25 2.52 2.52Q0.25 4.79 0.25 8Q0.25 11.21 2.52 13.48Q4.79 15.75 8 15.75Q11.21 15.75 13.48 13.48ZM12.03 3.97Q13.7 5.64 13.7 8Q13.7 10.36 12.03 12.03Q10.36 13.7 8 13.7Q5.64 13.7 3.97 12.03Q2.3 10.36 2.3 8Q2.3 5.64 3.97 3.97Q5.64 2.3 8 2.3Q10.36 2.3 12.03 3.97Z" shade="" />
