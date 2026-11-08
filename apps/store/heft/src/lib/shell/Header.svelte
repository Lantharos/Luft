<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import { WindowControls } from '@luft/ui';
	import { session } from '#lib/app/session.svelte.js';
	import Tabs from './Tabs.svelte';

	async function close() {
		await session.settle();
		await appWindow.close();
	}
</script>

<header class="drag-region flex h-[50px] flex-none items-center gap-3 pr-4 pl-3">
	<Tabs />
	<div class="flex-1"></div>
	<WindowControls onclose={() => void close()} />
</header>
