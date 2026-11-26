<script lang="ts">
	import FolderOpen from '@luft/symbols/icons/folder-open';
	import ImagePlus from '@luft/symbols/icons/image-plus';
	import StickyNote from '@luft/symbols/icons/sticky-note';
	import ImageIcon from '@luft/symbols/icons/image';
	import { t } from '@luft/i18n';
	import { GlassShell, WindowControls } from '@luft/ui';
	import { useApp } from '#lib/app/context.js';
	import { recent } from '#lib/app/recent.svelte.js';
	import { baseName } from '#lib/files/picture.js';
	import { previews } from './previews.svelte';

	const app = useApp();

	$effect(() => previews.request(recent.files.map((file) => file.path)));

	const actions = $derived([
		{ icon: ImagePlus, label: t('easel-new-image'), keys: 'Ctrl+N', run: () => (app.dialog = 'new-image') },
		{ icon: StickyNote, label: t('easel-new-board'), keys: 'Ctrl+Shift+N', run: () => app.newBoard() },
		{ icon: FolderOpen, label: t('easel-open'), keys: 'Ctrl+O', run: () => app.chooseAndOpen() }
	]);
</script>

<GlassShell class="h-full">
	<main class="glass-content">
		<header class="drag-region flex h-14 flex-none items-center justify-end pr-3">
			<WindowControls />
		</header>
		<div class="flex min-h-0 flex-1 flex-col items-center gap-12 overflow-y-auto px-8 pt-[12vh] pb-10">
			<div class="flex w-[320px] flex-col gap-0.5">
				{#each actions as action (action.label)}
					<button type="button" class="action" onclick={action.run}>
						<action.icon size={18} />
						<span class="flex-1 text-left">{action.label}</span>
						<span class="text-(--text-muted)">{action.keys}</span>
					</button>
				{/each}
			</div>
			{#if recent.files.length}
				<section class="flex w-full max-w-[880px] flex-col gap-4">
					<h2 class="px-1 text-[15px] font-semibold">{t('easel-recent')}</h2>
					<div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-4 gap-y-5">
						{#each recent.files as file (file.path)}
							{@const url = previews.urls[file.path]}
							<button type="button" class="recent" onclick={() => app.open(file.path)}>
								<span class="thumb">
									{#if url}<img src={url} alt="" draggable="false" />{:else}<ImageIcon size={22} />{/if}
								</span>
								<span class="truncate px-1 text-left text-[12.5px] font-medium">{baseName(file.path)}</span>
							</button>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	</main>
</GlassShell>

<style>
	.action {
		display: flex;
		height: 40px;
		align-items: center;
		gap: 12px;
		border-radius: var(--radius-pill);
		padding-inline: 16px;
		color: var(--text-soft);
		font-size: 13.5px;
		transition: background-color var(--motion-tap) var(--ease-decelerate), color var(--motion-tap) var(--ease-decelerate);
	}

	.action:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.recent {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 8px;
		border-radius: 14px;
	}

	.thumb {
		display: grid;
		aspect-ratio: 4 / 3;
		place-items: center;
		overflow: hidden;
		border-radius: 12px;
		background: var(--surface);
		color: var(--text-muted);
		transition: box-shadow var(--motion-tap) var(--ease-decelerate);
	}

	.thumb img {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}

	.recent:hover .thumb {
		box-shadow: 0 0 0 2px var(--accent-line);
	}
</style>
