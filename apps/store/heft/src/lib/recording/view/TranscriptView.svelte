<script lang="ts">
	import { t } from '@luft/i18n';
	import { formatClock } from '@luft/ui';
	import type { Said } from '#lib/bindings.js';
	import { player } from '../player.svelte';

	let { said }: { said: Said[] } = $props();

	let list: HTMLOListElement | undefined = $state();
	let playing = $derived.by(() => {
		const position = player.position;
		let index = -1;
		for (let at = 0; at < said.length && said[at].start <= position; at++) index = at;
		return index;
	});

	$effect(() => {
		if (playing < 0 || !player.playing) return;
		list?.children[playing]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	});
</script>

{#if said.length}
	<ol class="flex flex-col gap-0.5" bind:this={list}>
		{#each said as line, index (line.start)}
			<li>
				<button type="button" class="line" class:playing={index === playing} onclick={() => player.seek(line.start)}>
					<span class="time tabular-nums">{formatClock(line.start / 1000)}</span>
					<span class="min-w-0 flex-1">{line.text}</span>
				</button>
			</li>
		{/each}
	</ol>
{:else}
	<p class="px-2 text-[13px] text-(--text-muted)">{t('transcript-empty')}</p>
{/if}

<style>
	.line {
		display: flex;
		width: 100%;
		gap: 10px;
		border-radius: 10px;
		padding: 6px 8px;
		color: var(--text);
		font-size: 13.5px;
		line-height: 1.45;
		text-align: left;
	}

	.line:hover {
		background: var(--surface-hover);
	}

	.line.playing {
		background: color-mix(in oklab, var(--accent) 14%, transparent);
	}

	.time {
		flex: none;
		width: 40px;
		padding-top: 1px;
		color: var(--text-muted);
		font-size: 12px;
	}
</style>
