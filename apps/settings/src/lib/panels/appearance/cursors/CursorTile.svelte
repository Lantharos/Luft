<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import X from '@lucide/svelte/icons/x';
	import { cursorPreview, type CursorTheme } from './api';

	interface Props {
		theme: CursorTheme;
		selected: boolean;
		onselect: () => void;
		onremove: () => void;
	}

	let { theme, selected, onselect, onremove }: Props = $props();

	let tile = $state<HTMLDivElement>();
	let source = $state<string | null>(null);

	$effect(() => {
		const observer = new IntersectionObserver(
			async ([entry]) => {
				if (!entry.isIntersecting) return;
				observer.disconnect();
				source = fileUrl(await cursorPreview(theme.path));
			},
			{ rootMargin: '200px' }
		);
		observer.observe(tile!);
		return () => observer.disconnect();
	});
</script>

<div bind:this={tile} class="tile">
	<button type="button" class="choice" class:selected aria-pressed={selected} aria-label={theme.title} onclick={onselect}>
		<span class="preview">
			{#if source}
				<img src={source} alt="" decoding="async" />
			{/if}
		</span>
		<span class="name">{theme.title}</span>
	</button>
	{#if theme.removable}
		<button type="button" class="remove" aria-label="Remove {theme.title}" title="Remove" onclick={onremove}>
			<X size={14} />
		</button>
	{/if}
</div>

<style>
	.tile {
		position: relative;
	}

	.choice {
		display: grid;
		width: 100%;
		gap: 8px;
		border-radius: 14px;
		padding: 8px 8px 10px;
		text-align: left;
		transition: transform 180ms var(--ease), box-shadow 180ms var(--ease);
	}

	.choice:hover {
		transform: scale(1.02);
	}

	.choice.selected {
		box-shadow: 0 0 0 2px var(--content), 0 0 0 4px var(--accent);
	}

	.preview {
		display: grid;
		height: 56px;
		place-items: center;
		border-radius: 10px;
		background: var(--control);
	}

	img {
		height: 32px;
		animation: appear 240ms var(--ease);
	}

	.name {
		overflow: hidden;
		padding-inline: 4px;
		font-size: 13px;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--text-soft);
	}

	.remove {
		position: absolute;
		top: 2px;
		right: 2px;
		display: grid;
		height: 24px;
		width: 24px;
		place-items: center;
		border-radius: 999px;
		background: var(--popover);
		color: var(--text-soft);
		box-shadow: 0 2px 8px var(--shadow-faint);
		opacity: 0;
		transition: opacity 160ms var(--ease), color 160ms var(--ease);
	}

	.tile:hover .remove,
	.remove:focus-visible {
		opacity: 1;
	}

	.remove:hover {
		color: var(--danger);
	}

	@keyframes appear {
		from {
			opacity: 0;
		}
	}
</style>
