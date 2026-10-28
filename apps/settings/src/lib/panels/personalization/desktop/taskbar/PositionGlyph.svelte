<script lang="ts">
	import type { Position } from './options';

	let { position }: { position: Position } = $props();
</script>

<span class="screen" aria-hidden="true">
	<span class="bar {position}"></span>
</span>

<style>
	.screen {
		position: relative;
		display: block;
		width: 26px;
		height: 18px;
		border: 1.5px solid currentColor;
		border-radius: 4px;
		opacity: 0.9;
	}

	.bar {
		position: absolute;
		border-radius: 1px;
		background: currentColor;
	}

	.bottom,
	.top {
		right: 2px;
		left: 2px;
		height: 3px;
	}

	.left,
	.right {
		top: 2px;
		bottom: 2px;
		width: 3px;
	}

	.bottom {
		bottom: 2px;
	}

	.top {
		top: 2px;
	}

	.left {
		left: 2px;
	}

	.right {
		right: 2px;
	}
</style>
