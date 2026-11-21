<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import type { Snippet } from 'svelte';
	import GlassShell from '../shell/GlassShell.svelte';
	import { provideDialogWindow } from './window';

	let { children }: { children: Snippet } = $props();

	let reveal = () => {};
	appWindow.revealWhen(new Promise<void>((resolve) => (reveal = resolve)));

	provideDialogWindow({
		async fit(width, height) {
			await appWindow.setMinSize(width, height);
			await appWindow.setMaxSize(width, height);
			await appWindow.setSize(width, height);
			reveal();
		}
	});
</script>

<GlassShell>
	{@render children()}
</GlassShell>
