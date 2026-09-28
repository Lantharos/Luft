<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { DragController } from '$lib/file-manager/drag/controller.svelte';
	import { dropKey } from '$lib/file-manager/drag/drop-targets';
	import type { FileManager } from '$lib/file-manager/manager.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		acceptsDrops: boolean;
	}

	let { manager, drag, acceptsDrops }: Props = $props();

	let editing = $state(false);
	let draft = $state('');

	function segmentKey(path: string) {
		return dropKey('pathbar', path);
	}

	function droppable(path: string) {
		return acceptsDrops && drag.canDropOn(path);
	}

	function startEditing() {
		draft = manager.currentPath || manager.homePath;
		editing = true;
	}

	function focusInput(input: HTMLInputElement) {
		input.focus();
		input.select();
	}

	function commit() {
		if (!editing) return;
		editing = false;
		const next = draft.trim();
		if (next && next !== manager.currentPath) void manager.navigate(next);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== 'Escape' && event.key !== 'F2') return;
		event.preventDefault();
		event.stopPropagation();
		if (event.key === 'Enter') commit();
		if (event.key === 'Escape') editing = false;
	}

	function open(event: MouseEvent, path: string) {
		event.stopPropagation();
		if (path !== manager.currentPath) void manager.navigate(path);
	}
</script>

{#snippet segment(path: string, label: string | null)}
	{@const accepts = droppable(path)}
	<button
		class={['path-segment', drag.target?.key === segmentKey(path) && 'path-segment--drop']}
		type="button"
		aria-label={label ? undefined : 'Home folder'}
		data-drop-path={accepts ? path : undefined}
		data-drop-key={accepts ? segmentKey(path) : undefined}
		ondragover={(event) => accepts && drag.overPath(event, path, segmentKey(path))}
		ondragleave={drag.leave}
		ondrop={(event) => accepts && drag.drop(event, path)}
		onclick={(event) => open(event, path)}
	>
		{#if label}
			<span class="path-segment__label">{label}</span>
		{:else}
			<Icon name="home" size={16} />
		{/if}
	</button>
{/snippet}

{#if editing}
	<div
		class="flex h-10 min-w-0 flex-1 items-center gap-1 rounded-full bg-[var(--control)] px-2 py-1 text-[15px] text-[var(--text-soft)] shadow-[inset_0_1px_0_var(--hairline)]"
	>
		<span class="grid h-8 w-8 shrink-0 place-items-center">
			<Icon name="home" size={16} />
		</span>
		<Icon name="chevron-right" size={15} />
		<input
			{@attach focusInput}
			class="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--text)] outline-none"
			value={draft}
			aria-label="Current path"
			spellcheck="false"
			oninput={(event) => (draft = event.currentTarget.value)}
			onkeydown={handleKeydown}
			onblur={commit}
		/>
	</div>
{:else}
	<div
		class="flex h-10 min-w-0 flex-1 items-center gap-1 rounded-full bg-[var(--control)] px-2 py-1 text-[15px] text-[var(--text-soft)] shadow-[inset_0_1px_0_var(--hairline)] transition-[background-color,color] duration-150 hover:bg-[var(--control-hover)]"
		aria-label="Current path"
		role="group"
	>
		{@render segment(manager.homePath, null)}
		{#each manager.pathSegments as part (part.path)}
			<span class="path-segment__separator" aria-hidden="true">
				<Icon name="chevron-right" size={15} />
			</span>
			{@render segment(part.path, part.name)}
		{/each}
		<button class="path-segment path-segment--ghost flex-1" type="button" aria-label="Edit path" onclick={startEditing}></button>
	</div>
{/if}

<style>
	.path-segment {
		display: inline-grid;
		min-height: 32px;
		align-items: center;
		grid-auto-flow: column;
		gap: 6px;
		padding-inline: 10px;
		border-radius: 999px;
		color: var(--text-soft);
		font-size: 14px;
		transition:
			background-color 160ms cubic-bezier(0.2, 0, 0, 1),
			color 160ms cubic-bezier(0.2, 0, 0, 1),
			box-shadow 160ms cubic-bezier(0.2, 0, 0, 1),
			transform 160ms cubic-bezier(0.2, 0, 0, 1);
	}

	.path-segment:hover:not(.path-segment--ghost):not(.path-segment--drop) {
		background: var(--surface-hover);
		color: var(--text);
	}

	.path-segment:active:not(.path-segment--ghost) {
		transform: scale(0.97);
	}

	.path-segment--drop,
	.path-segment--drop:hover {
		background: rgba(200, 182, 111, 0.22);
		color: var(--text);
		box-shadow:
			inset 0 0 0 1.5px rgba(200, 182, 111, 0.7),
			inset 0 1px 0 var(--hairline);
		transform: translateY(-1px);
	}

	.path-segment--drop .path-segment__label {
		color: var(--text);
		font-weight: 600;
	}

	.path-segment--ghost {
		min-width: 0;
		align-self: stretch;
	}

	.path-segment__label {
		display: block;
		max-width: 180px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.path-segment__separator {
		display: inline-grid;
		place-items: center;
		color: var(--text-muted);
		opacity: 0.55;
	}
</style>
