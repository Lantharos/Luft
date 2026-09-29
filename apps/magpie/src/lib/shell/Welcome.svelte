<script lang="ts">
	import * as api from '$lib/api';
	import { openFile } from '$lib/app/actions';
	import { baseName } from '$lib/library/kinds';
	import { library } from '$lib/library/library.svelte';
	import OpenWithMenu from './OpenWithMenu.svelte';
</script>

<div class="grid h-full place-items-center p-8">
	<div class="flex max-w-[420px] flex-col items-center gap-2 text-center">
		{#if library.unopenable}
			<h2 class="text-[18px] font-semibold">{baseName(library.unopenable)} can't be opened here</h2>
			<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">Magpie shows photos, videos, music and PDFs.</p>
			<div class="mt-5 flex flex-wrap justify-center gap-2">
				<OpenWithMenu path={library.unopenable} />
				<button type="button" class="button" onclick={() => api.showInFolder(library.unopenable!)}>Show in folder</button>
			</div>
		{:else}
			<h2 class="text-[20px] font-semibold">Open something to look at</h2>
			<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">Photos, videos, music and PDFs open here. You can also drop a file onto this window.</p>
			<button type="button" class="button primary large mt-5" onclick={openFile}>Open…</button>
		{/if}
	</div>
</div>
