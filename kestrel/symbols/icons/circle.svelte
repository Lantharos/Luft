<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M13.66 13.66Q16 11.31 16 8Q16 4.69 13.66 2.34Q11.31 0 8 0Q4.69 0 2.34 2.34Q0 4.69 0 8Q0 11.31 2.34 13.66Q4.69 16 8 16Q11.31 16 13.66 13.66ZM12.16 3.84Q13.88 5.56 13.88 8Q13.88 10.44 12.16 12.16Q10.44 13.88 8 13.88Q5.56 13.88 3.84 12.16Q2.12 10.44 2.12 8Q2.12 5.56 3.84 3.84Q5.56 2.12 8 2.12Q10.44 2.12 12.16 3.84Z" shade="" />
