<script lang="ts">
	import NotebookCanvas from '#lib/canvas/NotebookCanvas.svelte';
	import type { Pane } from './pane.svelte';

	let { pane, active, onfocus, onquote }: { pane: Pane; active: boolean; onfocus: () => void; onquote?: (text: string) => void } = $props();

	$effect(() => pane.place());

	$effect(() => pane.follow());

	$effect(() => pane.remember({ zoom: pane.viewport.zoom, x: pane.viewport.x, y: pane.viewport.y }));
</script>

<div class="pane relative flex min-h-0 min-w-0 flex-1 flex-col" class:active onpointerdowncapture={onfocus}>
	<NotebookCanvas notebook={pane.notebook} viewport={pane.viewport} {onquote} />
</div>
