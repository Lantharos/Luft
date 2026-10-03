<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { tooltip } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';

	interface Item {
		id: string;
		name: string;
		mark: string;
	}

	let layouts = $derived(app.layouts.map((layout) => ({ id: layout.id, name: layout.name, mark: layout.short })));
	let methods = $derived(app.methods.map((method) => ({ id: method.id, name: method.name, mark: method.label })));

	type Kind = 'layout' | 'method';

	function active(kind: Kind, id: string) {
		return app.selection?.kind === kind && app.selection.id === id;
	}
</script>

{#snippet group(title: string, kind: Kind, items: Item[], add: string)}
	<section class="flex flex-col gap-0.5">
		<div class="flex h-8 items-center justify-between pr-1 pl-3">
			<h2 class="text-[13px] font-medium text-[var(--sidebar-text-muted)]">{title}</h2>
			<button type="button" class="add" aria-label={add} {@attach tooltip(add)} onclick={() => (app.creating = kind === 'layout' ? { kind, from: null } : { kind })}>
				<Plus size={16} />
			</button>
		</div>
		{#each items as item (item.id)}
			<button
				type="button"
				class="nav-item"
				class:active={active(kind, item.id)}
				aria-current={active(kind, item.id) ? 'page' : undefined}
				onclick={() => app.select({ kind, id: item.id })}
			>
				<span class="mark">{item.mark}</span>
				<span class="truncate">{item.name}</span>
			</button>
		{/each}
	</section>
{/snippet}

<aside class="glass-sidebar drag-region px-3 py-4">
	<nav class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
		{@render group('Layouts', 'layout', layouts, 'New layout')}
		{@render group('Input methods', 'method', methods, 'New input method')}
	</nav>
</aside>

<style>
	.add {
		display: grid;
		height: 28px;
		width: 28px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--sidebar-text-muted);
		transition:
			background-color 150ms var(--ease),
			color 150ms var(--ease);
	}

	.add:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.nav-item {
		display: flex;
		height: 38px;
		width: 100%;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-pill);
		padding-inline: 12px;
		text-align: left;
		font-size: 14px;
		color: var(--sidebar-text);
		transition:
			background-color 150ms var(--ease),
			color 150ms var(--ease),
			transform 150ms var(--ease);
	}

	.nav-item:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.nav-item.active {
		background: var(--sidebar-active);
		color: var(--text);
		font-weight: 500;
	}

	.nav-item:active {
		transform: scale(0.97);
	}

	.mark {
		width: 26px;
		flex: none;
		overflow: hidden;
		font-size: 12.5px;
		font-weight: 500;
		color: var(--sidebar-text-muted);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
