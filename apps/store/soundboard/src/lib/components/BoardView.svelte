<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Square from '@lucide/svelte/icons/square';
	import { SearchField, WindowControls } from '@luft/ui';
	import { t } from '@luft/i18n';
	import { app } from '#lib/state/app.svelte.js';
	import { commands } from '#lib/bindings.js';
	import Tile from './Tile.svelte';

	let dragging = $state(false);

	function dragged(event: DragEvent) {
		if (!event.dataTransfer?.types.includes('Files')) return;
		event.preventDefault();
		dragging = true;
	}

	function dropped(event: DragEvent) {
		if (!event.dataTransfer) return;
		event.preventDefault();
		dragging = false;
		app.dropped(event.dataTransfer);
	}
</script>

<main class="glass-content" class:dragging ondragover={dragged} ondragleave={() => (dragging = false)} ondrop={dropped}>
	<header class="drag-region flex h-[60px] flex-none items-center gap-2 pr-4 pl-6">
		<div class="w-[240px]"><SearchField bind:value={app.search} label={t('sounds-search')} /></div>
		<div class="flex-1"></div>
		<button type="button" class="button" disabled={!app.status.playing.length} onclick={() => void commands.stopAll()}>
			<Square size={14} />{t('sounds-stop-all')}
		</button>
		<button type="button" class="button primary" onclick={() => void app.addSounds()}><Plus size={16} />{t('sounds-add')}</button>
		<div class="ml-2"><WindowControls /></div>
	</header>
	<div class="soft-scroll min-h-0 flex-1 overflow-y-auto px-6 pt-2 pb-8">
		{#if app.sounds.length}
			<div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
				{#each app.sounds as sound (sound.id)}
					<Tile {sound} onmenu={(at) => (app.menu = { kind: 'sound', sound, at })} />
				{/each}
			</div>
		{:else if app.search}
			<p class="pt-[14vh] text-center text-[15px] text-[var(--text-muted)]">{t('empty-search', { search: app.search })}</p>
		{:else}
			<div class="flex flex-col items-center gap-2 pt-[16vh] text-center">
				<h2 class="text-[22px] font-semibold">{t('empty-title')}</h2>
				<p class="max-w-[42ch] text-[14px] text-[var(--text-muted)]">{t('empty-detail')}</p>
			</div>
		{/if}
	</div>
</main>

<style>
	.dragging {
		outline: 2px solid var(--accent);
		outline-offset: -6px;
	}
</style>
