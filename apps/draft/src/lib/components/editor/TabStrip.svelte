<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { useApp } from '$lib/context';
	import type { Document } from '$lib/documents/document.svelte';
	import { documentMenu } from '$lib/files/actions';

	const app = useApp();
	let workspace = $derived(app.workspace);
	let dragged = $state<Document | null>(null);

	function scrollIntoView(node: HTMLElement, active: boolean) {
		if (active) node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	}

	function drop(target: Document) {
		if (dragged && dragged !== target) workspace.move(dragged, workspace.documents.indexOf(target));
		dragged = null;
	}
</script>

<div class="hidden-scroll flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" role="tablist" aria-label="Open files" data-no-drag>
	{#each workspace.documents as document (document.id)}
		{@const active = document === workspace.active}
		<div
			class={['tab', active && 'is-active', dragged === document && 'is-dragged']}
			role="presentation"
			draggable="true"
			{@attach (node) => scrollIntoView(node, active)}
			ondragstart={() => (dragged = document)}
			ondragend={() => (dragged = null)}
			ondragover={(event) => dragged && event.preventDefault()}
			ondrop={() => drop(document)}
			oncontextmenu={(event) => app.menus.open(event, documentMenu(app, document))}
		>
			<button
				type="button"
				class="tab-main"
				role="tab"
				aria-selected={active}
				title={document.path ?? document.name}
				onclick={() => workspace.activate(document)}
				onauxclick={(event) => event.button === 1 && void workspace.close(document)}
			>
				<span class="truncate">{document.name}</span>
			</button>
			<button type="button" class={['tab-close', document.dirty && 'is-dirty']} aria-label="Close {document.name}" onclick={() => void workspace.close(document)}>
				<X size={12} class="close-icon" />
			</button>
		</div>
	{/each}
</div>

<style>
	.tab {
		display: flex;
		height: 32px;
		min-width: 96px;
		max-width: 220px;
		flex: 0 1 auto;
		align-items: center;
		border-radius: 10px;
		color: var(--text-muted);
		transition: background-color 140ms var(--ease), color 140ms var(--ease), opacity 140ms var(--ease);
	}

	.tab:hover {
		background: var(--surface-hover);
		color: var(--text-soft);
	}

	.tab.is-active {
		background: var(--control);
		color: var(--text);
	}

	.tab.is-dragged {
		opacity: 0.5;
	}

	.tab-main {
		display: flex;
		height: 100%;
		min-width: 0;
		flex: 1;
		align-items: center;
		padding-left: 12px;
		font-size: 13px;
	}

	.tab-close {
		position: relative;
		display: grid;
		height: 22px;
		width: 22px;
		margin: 0 5px 0 4px;
		flex: none;
		place-items: center;
		border-radius: var(--radius-pill);
		opacity: 0;
		transition: opacity 140ms var(--ease), background-color 140ms var(--ease);
	}

	.tab:hover .tab-close,
	.tab.is-active .tab-close,
	.tab-close.is-dirty {
		opacity: 1;
	}

	.tab-close.is-dirty::after {
		content: '';
		position: absolute;
		height: 7px;
		width: 7px;
		border-radius: 50%;
		background: currentColor;
	}

	.tab-close.is-dirty :global(.close-icon),
	.tab:hover .tab-close.is-dirty::after {
		opacity: 0;
	}

	.tab:hover .tab-close :global(.close-icon) {
		opacity: 1;
	}

	.tab-close:hover {
		background: var(--surface-hover);
	}
</style>
