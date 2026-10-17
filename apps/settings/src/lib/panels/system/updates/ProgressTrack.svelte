<script lang="ts">
	let { fraction, class: className }: { fraction: number | null; class: string } = $props();
</script>

<div class="track {className}">
	<span class="progress-fill" class:indeterminate={fraction === null} style:--progress={fraction}></span>
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
	}

	.indeterminate {
		width: 30%;
		translate: none;
		animation: slide 1.4s var(--ease-point) infinite;
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
