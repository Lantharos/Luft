<script lang="ts">
	interface Props {
		rounded: boolean;
	}

	let { rounded }: Props = $props();
</script>

<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
	<path d={rounded ? 'M2.5 16V8.5a6 6 0 0 1 6-6H16' : 'M2.5 16V2.5H16'} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
</svg>
