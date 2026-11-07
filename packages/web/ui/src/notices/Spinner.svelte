<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	let { size = 16, class: className }: { size?: number; class?: ClassValue } = $props();
</script>

<svg class={['spinner', className]} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
	<g class="round">
		<circle cx="12" cy="12" r="9" stroke-opacity="0.2" />
		<circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-dasharray="15 42" />
	</g>
	<g class="square">
		<rect x="3" y="3" width="18" height="18" stroke-opacity="0.2" />
		<rect class="lead" x="3" y="3" width="18" height="18" pathLength="100" stroke-dasharray="25 75" />
	</g>
</svg>

<style>
	.spinner {
		flex: none;
	}

	.spinner .round {
		transform-origin: center;
		animation: spin 0.75s linear infinite !important;
	}

	.spinner .lead {
		animation: travel 1s linear infinite !important;
	}

	.spinner .square,
	:global(:root[data-corners='square']) .spinner .round {
		display: none;
	}

	:global(:root[data-corners='square']) .spinner .square {
		display: inline;
	}

	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}

	@keyframes travel {
		to {
			stroke-dashoffset: -100;
		}
	}
</style>
