<script lang="ts">
	import type { Item } from '#lib/bridge/api.js';
	import * as api from '#lib/bridge/api.js';
	import OpenWithMenu from './OpenWithMenu.svelte';

	let { item, message, detail }: { item: Item; message: string; detail?: string } = $props();
</script>

<div class="absolute inset-0 grid place-items-center p-8">
	<div class="flex max-w-[440px] flex-col items-center gap-2 text-center">
		<p class="text-[16px] font-medium text-[var(--text)]">{message}</p>
		{#if detail}
			<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">{detail}</p>
		{/if}
		<div class="mt-4 flex flex-wrap justify-center gap-2">
			<OpenWithMenu path={item.path} />
			<button type="button" class="button" onclick={() => api.showInFolder(item.path)}>Show in folder</button>
		</div>
	</div>
</div>
