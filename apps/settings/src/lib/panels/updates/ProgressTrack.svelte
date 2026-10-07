<script lang="ts">
	let { fraction, class: className }: { fraction: number | null; class: string } = $props();
</script>

<div class="track {className}">
	<span class:indeterminate={fraction === null} style:width={fraction === null ? undefined : `${fraction * 100}%`}></span>
</div>

<style>
	.track {
		overflow: hidden;
		border-radius: var(--radius-pill);
	}

	span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--accent);
		transition: width 240ms var(--ease);
	}

	.indeterminate {
		width: 30%;
		animation: slide 1.4s var(--ease) infinite;
	}

	@keyframes slide {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(340%);
		}
	}
</style>
