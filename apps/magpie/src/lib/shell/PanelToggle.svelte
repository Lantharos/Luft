<script lang="ts">
	import { tooltip } from '@luft/ui';
	import GalleryHorizontalEnd from '@lucide/svelte/icons/gallery-horizontal-end';
	import ListMusic from '@lucide/svelte/icons/list-music';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import { chrome } from '$lib/app/chrome.svelte';
	import type { Group } from '$lib/library/kinds';

	let { group }: { group: Group } = $props();

	let pressed = $derived(group === 'visual' ? chrome.strip : chrome.panel);
	let label = $derived(group === 'visual' ? 'Thumbnails' : group === 'audio' ? 'Queue' : 'Pages');
	let Icon = $derived(group === 'visual' ? GalleryHorizontalEnd : group === 'audio' ? ListMusic : PanelLeft);

	function toggle() {
		if (group === 'visual') chrome.toggleStrip();
		else chrome.panel = !chrome.panel;
	}
</script>

<button type="button" class="icon-button" class:on={pressed} aria-label={label} aria-pressed={pressed} onclick={toggle} {@attach tooltip(label)}>
	<Icon size={17} />
</button>

<style>
	.on {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
