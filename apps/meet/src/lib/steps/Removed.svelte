<script lang="ts">
	import { appWindow, isAvailable } from '@lantharos/sabine';
	import { session } from '#lib/state/meet.svelte.js';
</script>

<section class="flex h-full flex-col justify-end px-14 pb-14">
	<h1 class="text-[40px] leading-none font-semibold tracking-[-0.01em]">All back to how it was</h1>
	<p class="mt-5 max-w-[470px] text-[16px] leading-relaxed text-[var(--text-soft)]">
		{#if session.platform === 'linux'}
			Luft’s files and its start entry are gone, and your computer starts just like before. Come back any time.
		{:else}
			Luft’s partitions and its start entry are gone, and Windows has all of its space again. Come back any time.
		{/if}
	</p>
	<div class="mt-9">
		<button type="button" class="button large px-6" onclick={() => isAvailable() && appWindow.close()}>Close</button>
	</div>
</section>
