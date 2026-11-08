<script lang="ts">
	import House from '@lucide/svelte/icons/house';
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import { session } from '#lib/app/session.svelte.js';
	import { dropTarget } from '#lib/drag/drag.svelte.js';
	import { library } from '#lib/library/library.svelte.js';

	const color = (subject: string) => library.subject(subject)?.meta.color ?? 'var(--text-muted)';
</script>

<div class="flex min-w-0 items-center gap-1" role="tablist" aria-label={t('tabs-label')} data-no-drag>
	<button
		type="button"
		class="tab home"
		role="tab"
		aria-selected={session.current === null}
		aria-label={t('tabs-home')}
		{@attach tooltip(t('tabs-home'))}
		onclick={() => session.home()}
	>
		<House size={17} />
	</button>
	{#each session.tabs as tab (tab.meta.id)}
		<div class="tab-wrap" {@attach dropTarget({ kind: 'notebook', id: tab.meta.id })}>
			<button type="button" class="tab" role="tab" aria-selected={session.current === tab} onclick={() => session.show(tab)}>
				<span class="size-2 flex-none rounded-full" style:background={color(tab.meta.subject)}></span>
				<span class="truncate">{tab.meta.name}</span>
			</button>
			<button type="button" class="close" aria-label={t('tabs-close', { name: tab.meta.name })} onclick={() => session.close(tab)}>
				<X size={13} />
			</button>
		</div>
	{/each}
</div>

<style>
	.tab-wrap {
		position: relative;
		display: flex;
		min-width: 0;
		max-width: 200px;
	}

	.tab {
		display: flex;
		min-width: 0;
		height: 34px;
		flex: 1;
		align-items: center;
		gap: 8px;
		border-radius: var(--radius-pill);
		padding-inline: 14px 30px;
		color: var(--text-soft);
		font-size: 13px;
		font-weight: 500;
		transition: background-color var(--motion-tap);
	}

	.tab.home {
		width: 34px;
		flex: none;
		justify-content: center;
		padding: 0;
	}

	.tab:hover {
		background: var(--surface-hover);
	}

	.tab[aria-selected='true'] {
		background: var(--control);
		color: var(--text);
	}

	.close {
		position: absolute;
		top: 50%;
		right: 8px;
		display: grid;
		height: 20px;
		width: 20px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		transform: translateY(-50%);
	}

	.close:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.tab-wrap:global([data-drop-over]) .tab {
		background: var(--accent-soft);
	}
</style>
