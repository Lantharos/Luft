<script lang="ts">
	import { t } from '@luft/i18n';
	import Plus from '@lucide/svelte/icons/plus';
	import { selectionPill, tooltip } from '@luft/ui';
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
		<div class="nav-heading">
			<h2>{title}</h2>
			<button type="button" class="nav-action" aria-label={add} {@attach tooltip(add)} onclick={() => (app.creating = kind === 'layout' ? { kind, from: null } : { kind })}>
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
	<nav class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto" {@attach selectionPill()}>
		{@render group(t('keys-sidebar-layouts'), 'layout', layouts, t('keys-new-layout'))}
		{@render group(t('keys-sidebar-methods'), 'method', methods, t('keys-new-method'))}
	</nav>
</aside>

<style>
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
