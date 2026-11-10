<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Grip from '@lucide/svelte/icons/grip';
	import Plus from '@lucide/svelte/icons/plus';
	import Square from '@lucide/svelte/icons/square';
	import { SearchField, WindowControls } from '@luft/ui';
	import { t } from '@luft/i18n';
	import { app } from '#lib/state/app.svelte.js';
	import { arrangement } from '#lib/state/arrange.svelte.js';
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
		{#if arrangement.on || (app.sounds.length > 1 && !app.search)}
			<button type="button" class="button" class:primary={arrangement.on} aria-pressed={arrangement.on} onclick={arrangement.toggle}>
				{#if arrangement.on}<Check size={16} />{t('sounds-arrange-done')}{:else}<Grip size={16} />{t('sounds-arrange')}{/if}
			</button>
		{/if}
		<button type="button" class="button" disabled={!app.status.playing.length} onclick={() => void commands.stopAll()}>
			<Square size={14} />{t('sounds-stop-all')}
		</button>
		<button type="button" class="button primary" onclick={() => void app.addSounds()}><Plus size={16} />{t('sounds-add')}</button>
		<div class="ml-2"><WindowControls /></div>
	</header>
	<div class="soft-scroll min-h-0 flex-1 overflow-y-auto px-6 pt-2 pb-8">
		{#if app.sounds.length}
			<div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
				{#each app.sounds as sound, index (sound.id)}
					{@const lifted = arrangement.drag?.from === index}
					<div
						class="slot"
						class:lifted
						class:sliding={arrangement.drag && (!lifted || arrangement.dropping)}
						style:translate={arrangement.shift(index)}
						animate:arrangement.settle
					>
						<Tile {sound} {index} onmenu={(at) => (app.menu = { kind: 'sound', sound, at })} />
					</div>
				{/each}
			</div>
			<p class="sr-only" aria-live="polite">{arrangement.moved ? t('sounds-arrange-moved', arrangement.moved) : ''}</p>
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
	.slot {
		position: relative;
		border-radius: var(--radius-group);
	}

	.slot.sliding {
		transition:
			translate var(--motion-standard) var(--ease-decelerate),
			scale var(--motion-standard) var(--ease-decelerate),
			box-shadow var(--motion-standard) var(--ease-decelerate);
	}

	.slot.lifted {
		z-index: 1;
		scale: 1.04;
		box-shadow: 0 12px 40px var(--shadow-soft);
	}

	.slot.lifted.sliding {
		scale: 1;
		box-shadow: none;
	}

	.dragging {
		outline: 2px solid var(--accent);
		outline-offset: -6px;
	}
</style>
