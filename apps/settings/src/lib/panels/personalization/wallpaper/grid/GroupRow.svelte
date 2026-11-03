<script lang="ts">
	import { t } from '@luft/i18n';
	import { fileUrl } from '@lantharos/sabine';
	import { Row } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { WallpaperGroup } from '../library.svelte';

	const PREVIEWED = 3;

	interface Props {
		group: WallpaperGroup;
		current: string;
		shape: number;
		onopen: () => void;
	}

	let { group, current, shape, onopen }: Props = $props();

	let holdsCurrent = $derived(group.wallpapers.some((wallpaper) => wallpaper.path === current));
	let previewed = $derived(
		(holdsCurrent ? [current, ...group.wallpapers.map((wallpaper) => wallpaper.path).filter((path) => path !== current)] : group.wallpapers.map((wallpaper) => wallpaper.path)).slice(0, PREVIEWED)
	);
	let sources = $state<Record<string, string>>({});

	$effect(() => {
		for (const path of previewed) {
			if (sources[path]) continue;
			void commands.appearanceThumbnail({ path }).then((thumb) => (sources[path] = fileUrl(thumb)));
		}
	});
</script>

<Row title={group.name} description={t('settings-appearance-wallpaper-count', { count: group.wallpapers.length })} onclick={onopen}>
	<span class="stack" style:--shape={shape}>
		{#each previewed as path, index (path)}
			<span class="thumb" class:selected={holdsCurrent && index === 0} style:z-index={PREVIEWED - index}>
				{#if sources[path]}
					<img src={sources[path]} alt="" decoding="async" />
				{/if}
			</span>
		{/each}
	</span>
</Row>

<style>
	.stack {
		display: flex;
		padding: 4px;
	}

	.thumb {
		height: 36px;
		aspect-ratio: var(--shape);
		overflow: hidden;
		border-radius: 7px;
		background: var(--control);
		box-shadow: 0 0 0 2px var(--content);
	}

	.thumb + .thumb {
		margin-left: calc(-18px * var(--shape));
	}

	.thumb.selected {
		box-shadow: 0 0 0 2px var(--content), 0 0 0 4px var(--accent);
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: cover;
		animation: appear var(--motion-standard) var(--ease-decelerate);
	}

	@keyframes appear {
		from {
			opacity: 0;
		}
	}
</style>
