<script lang="ts">
	import { pointAt } from '#lib/typing/caret.js';
	import { marked } from './converter.svelte';

	let { page, zoom, revision }: { page: string; zoom: number; revision: number } = $props();

	let at: { left: number; top: number; height: number } | null = $state(null);

	$effect(() => {
		void revision;
		void zoom;
		const insertion = marked.insertion;
		const box = insertion?.page === page ? document.querySelector<HTMLElement>(`[data-object="${insertion.object}"]`) : null;
		const sheet = box?.closest('[data-page]');
		if (!insertion || !box || !sheet) {
			at = null;
			return;
		}
		const range = document.createRange();
		range.setStart(...pointAt(box, insertion.offset));
		const rect = range.getClientRects()[0] ?? box.getBoundingClientRect();
		const origin = sheet.getBoundingClientRect();
		at = { left: rect.left - origin.left, top: rect.top - origin.top, height: rect.height };
	});
</script>

{#if at}
	<span class="mark" style:left="{at.left}px" style:top="{at.top}px" style:height="{at.height}px"></span>
{/if}

<style>
	.mark {
		position: absolute;
		width: 2px;
		border-radius: 1px;
		background: #3d7bd9;
		pointer-events: none;
		animation: blink 1.1s steps(1) infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
