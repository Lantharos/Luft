<script lang="ts">
	import Symbol from '../src/Symbol.svelte';
	import type { SymbolProps } from '../src/props.ts';

	let props: SymbolProps = $props();
</script>

<Symbol {...props} ink="M8 0.5C7.5 0.5 7 1.1 7 1.8L7 6.2L1.4 8.6C1.1 8.8 1 9 1 9.3L1 10.2L7 8.4L7 12.8L5.4 14L5.4 15L8 14.4L10.6 14.9L10.6 13.9L9 12.7L9 9.3L15 11.1L15 10.2C15 9.9 14.9 9.7 14.6 9.5L9 6.2L9 1.8C9 1.1 8.5 0.5 8 0.5Z" shade="" />
