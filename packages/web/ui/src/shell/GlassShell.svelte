<script lang="ts">
	import { appWindow, type WindowState } from '@lantharos/sabine';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { appearance } from '../appearance.svelte';
	import TextMenu from '../menus/TextMenu.svelte';
	import { sheetRegions } from './sheetRegions';

	interface Props {
		class?: ClassValue;
		followSidebar?: boolean;
		children: Snippet;
	}

	let { class: className, followSidebar = false, children }: Props = $props();

	let floating = $state(true);

	$effect(() => {
		const follow = ({ maximized, fullscreen, tiled }: WindowState) => (floating = !(maximized || fullscreen || tiled));
		follow(appWindow);
		return appWindow.onStateChanged(follow);
	});
</script>

<div
	class={['glass-shell', className]}
	data-effect={appearance.translucent ? 'translucent' : 'solid'}
	data-window={floating ? 'floating' : 'docked'}
	{@attach followSidebar && sheetRegions}
>
	{@render children()}
</div>

<TextMenu />
