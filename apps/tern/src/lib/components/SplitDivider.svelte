<script lang="ts">
	import type { SplitNode } from '#lib/workspace/layout.js';

	const MIN_RATIO = 0.1;

	interface Props {
		node: SplitNode;
	}

	let { node }: Props = $props();

	let dragging = $state(false);

	function start(event: PointerEvent) {
		const divider = event.currentTarget as HTMLElement;
		divider.setPointerCapture(event.pointerId);
		dragging = true;
	}

	function move(event: PointerEvent) {
		if (!dragging) return;
		const box = (event.currentTarget as HTMLElement).parentElement!.getBoundingClientRect();
		const ratio = node.direction === 'row' ? (event.clientX - box.left) / box.width : (event.clientY - box.top) / box.height;
		node.ratio = Math.min(1 - MIN_RATIO, Math.max(MIN_RATIO, ratio));
	}
</script>

<div
	class="split-divider"
	class:is-dragging={dragging}
	role="separator"
	aria-orientation={node.direction === 'row' ? 'vertical' : 'horizontal'}
	onpointerdown={start}
	onpointermove={move}
	onpointerup={() => (dragging = false)}
	onpointercancel={() => (dragging = false)}
	ondblclick={() => (node.ratio = 0.5)}
></div>
