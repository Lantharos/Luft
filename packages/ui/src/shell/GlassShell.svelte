<script lang="ts">
	import { appWindow, type WindowState } from '@lantharos/sabine';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { appearance } from '../appearance.svelte';
	import TextMenu from '../menus/TextMenu.svelte';

	interface Props {
		class?: ClassValue;
		children: Snippet;
	}

	let { class: className, children }: Props = $props();

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
>
	{@render children()}
</div>

<TextMenu />
