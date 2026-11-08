<script lang="ts">
	import { untrack } from 'svelte';
	import { cleanHtml, type PageObject } from '#lib/page/objects.js';
	import { blockShortcut } from '#lib/typing/shortcuts.js';
	import { caretAt, caretAtEnd } from '#lib/typing/caret.js';
	import { editing } from './editing.svelte';

	let {
		object,
		zoom,
		editable,
		draft = false,
		onchange,
		onoverflow
	}: {
		object: PageObject;
		zoom: number;
		editable: boolean;
		draft?: boolean;
		onchange: (next: PageObject | null) => void;
		onoverflow?: (element: HTMLElement) => void;
	} = $props();

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
		const wanted = editing.focus;
		if (wanted?.id !== object.id) return;
		if (!editable) {
			untrack(() => (editing.active = object.id));
			return;
		}
		untrack(() => {
			editing.focus = null;
			element.focus({ preventScroll: true });
			if (wanted.at) caretAt(element, wanted.at);
			else if (wanted.offset !== undefined) caretAt(element, wanted.offset);
			else caretAtEnd(element);
		});
	});

	function save(leaving = false) {
		clearTimeout(timer);
		const text = element.innerText.trim();
		const html = cleanHtml(element.innerHTML);
		if (draft && !text) return leaving && onchange(null);
		if (html === object.html) return;
		onchange(text ? { ...object, html, text, height: element.offsetHeight, typedAt: object.typedAt ?? Date.now() } : null);
	}

	function input() {
		clearTimeout(timer);
		timer = window.setTimeout(() => save(), SAVE_AFTER);
		if (object.flow) onoverflow?.(element);
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			element.blur();
		} else if (event.key === ' ' && blockShortcut(element)) event.preventDefault();
	}

	function blur() {
		if (editing.active === object.id) editing.active = null;
		save(true);
	}
</script>

<div
	bind:this={element}
	class="text-box"
	class:ruled={object.line !== undefined}
	class:editable
	style:left="{object.x * zoom}px"
	style:top="{object.y * zoom}px"
	style:width="{object.width}px"
	style:transform="scale({zoom})"
	style:--line={object.line && `${object.line}px`}
	style:--size={object.size && `${object.size}px`}
	contenteditable={editable}
	role="textbox"
	tabindex={editable ? 0 : -1}
	aria-multiline="true"
	data-object={object.id}
	oninput={input}
	onkeydown={keydown}
	onfocus={() => (editing.active = object.id)}
	onblur={blur}
	onpointerdown={(event) => editable && event.pointerType !== 'pen' && event.stopPropagation()}
></div>
