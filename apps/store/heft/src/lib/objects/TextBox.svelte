<script lang="ts">
	import { untrack } from 'svelte';
	import { cleanHtml, type PageObject } from '#lib/page/objects.js';

	let { object, zoom, editable, focus, onchange }: { object: PageObject; zoom: number; editable: boolean; focus: boolean; onchange: (next: PageObject | null) => void } = $props();

	const SAVE_AFTER = 700;

	let element: HTMLDivElement;
	let timer = 0;

	$effect(() => {
		const html = object.html ?? '';
		untrack(() => {
			if (document.activeElement !== element && element.innerHTML !== html) element.innerHTML = html;
		});
	});

	$effect(() => {
		if (focus) untrack(() => element.focus());
	});

	function save() {
		clearTimeout(timer);
		const text = element.innerText.trim();
		const html = cleanHtml(element.innerHTML);
		if (html === object.html) return;
		onchange(text ? { ...object, html, text, height: element.offsetHeight } : null);
	}

	function input() {
		clearTimeout(timer);
		timer = window.setTimeout(save, SAVE_AFTER);
	}
</script>

<div
	bind:this={element}
	class="text-box"
	class:editable
	style:left="{object.x * zoom}px"
	style:top="{object.y * zoom}px"
	style:width="{object.width}px"
	style:transform="scale({zoom})"
	contenteditable={editable}
	role="textbox"
	tabindex={editable ? 0 : -1}
	aria-multiline="true"
	oninput={input}
	onblur={save}
	onpointerdown={(event) => editable && event.stopPropagation()}
></div>

<style>
	.text-box {
		position: absolute;
		min-height: 24px;
		transform-origin: 0 0;
		border-radius: 4px;
		padding: 2px 4px;
		color: #1d1d1f;
		font-size: 16px;
		line-height: 1.45;
		overflow-wrap: anywhere;
		outline: none;
		pointer-events: none;
		user-select: text;
	}

	.text-box.editable {
		pointer-events: auto;
		cursor: text;
	}

	.text-box.editable:focus {
		box-shadow: 0 0 0 1px color-mix(in oklab, #3d7bd9 70%, transparent);
	}

	.text-box :global(h2) {
		font-size: 24px;
		font-weight: 700;
		line-height: 1.25;
	}

	.text-box :global(h3) {
		font-size: 19px;
		font-weight: 650;
	}

	.text-box :global(ul) {
		list-style: disc;
		padding-left: 22px;
	}

	.text-box :global(ol) {
		list-style: decimal;
		padding-left: 22px;
	}

	.text-box :global(blockquote) {
		border-left: 3px solid #c6d1e2;
		padding-left: 10px;
		color: #3e3e3a;
	}
</style>
