<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Clock from '@lucide/svelte/icons/clock';
	import Folder from '@lucide/svelte/icons/folder';
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import House from '@lucide/svelte/icons/house';
	import Server from '@lucide/svelte/icons/server';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import Trash from '@lucide/svelte/icons/trash';
	import Usb from '@lucide/svelte/icons/usb';
	import { isInside } from '@luft/ui';
	import { untrack, type Component } from 'svelte';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import { dropKey } from '#lib/file-manager/drag/drop-targets.js';
	import { PathCompletion } from '#lib/file-manager/location/completion.svelte.js';
	import { looksRemote } from '#lib/file-manager/location/addresses.js';
	import { expandHome } from '#lib/file-manager/location/expand.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import type { ViewState } from '#lib/file-manager/view/view-state.svelte.js';
	import { pathSegments, trimTrailingSlash } from '#lib/utils/paths.js';

	interface Props {
		manager: FileManager;
		drag: DragController;
		view: ViewState;
		acceptsDrops: boolean;
	}

	let { manager, drag, view, acceptsDrops }: Props = $props();

	type Crumb = { path: string; label: string; icon?: Component };

	const VIEW_CRUMBS: Record<'recent' | 'trash', Crumb> = {
		recent: { path: '', label: 'Recent', icon: Clock },
		trash: { path: '', label: 'Trash', icon: Trash }
	};

	const completion = new PathCompletion(() => manager.homePath);

	let trail = $state<HTMLDivElement>();
	let draft = $state('');
	let clipped = $state(false);
	let trailWidth = $state(0);

	let root = $derived.by((): Crumb => {
		const path = manager.currentPath;
		if (isInside(path, manager.homePath)) return { path: manager.homePath, label: 'Home', icon: House };
		const remote = manager.network.holding(path);
		if (remote) return { path: remote.path, label: remote.name, icon: remote.device ? Smartphone : Server };
		const drive = manager.drives.holding(path);
		if (!drive) return { path: '/', label: 'Computer', icon: HardDrive };
		return { path: drive.mount_point, label: drive.name, icon: drive.is_removable ? Usb : HardDrive };
	});
	let crumbs = $derived.by((): Crumb[] => {
		if (manager.view !== 'home') return [VIEW_CRUMBS[manager.view]];
		const segments = pathSegments(manager.currentPath).filter((segment) => segment.path.length > root.path.length);
		return [root, ...segments.map((segment) => ({ path: segment.path, label: segment.name }))];
	});

	$effect(() => {
		if (crumbs.length === 0 || !trail || trailWidth === 0) return;
		trail.scrollLeft = trail.scrollWidth;
		clipped = trail.scrollLeft > 0;
	});

	$effect(() => {
		if (!view.editingPath) completion.forget();
	});

	function focusInput(input: HTMLInputElement) {
		untrack(() => {
			const path = manager.currentPath || manager.homePath;
			draft = manager.network.addressOf(path) ?? path;
			input.value = draft;
		});
		input.focus();
		input.select();
	}

	function commit() {
		view.editingPath = false;
		if (looksRemote(draft)) return void manager.openAddress(draft);
		const next = trimTrailingSlash(expandHome(draft.trim(), manager.homePath));
		if (next && next !== manager.currentPath) void manager.navigate(next);
	}

	async function complete(backwards: boolean) {
		const typed = draft;
		const completed = await completion.complete(typed, backwards);
		if (completed !== null && draft === typed) draft = completed;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== 'Escape' && event.key !== 'Tab') return;
		event.preventDefault();
		event.stopPropagation();
		if (event.key === 'Tab') void complete(event.shiftKey);
		else if (event.key === 'Enter') commit();
		else if (completion.candidates.length > 0) completion.reset();
		else view.editingPath = false;
	}

	function choose(name: string) {
		draft = completion.choose(name);
	}

	function open(path: string) {
		if (!path) return;
		if (manager.view !== 'home' || path !== manager.currentPath) void manager.navigate(path);
	}

	function segmentKey(path: string) {
		return dropKey('pathbar', path);
	}
</script>

<div class={['path-bar', view.editingPath && 'is-editing']} data-no-drag>
	{#if view.editingPath}
		<input
			{@attach focusInput}
			class="path-input"
			value={draft}
			aria-label="Location"
			spellcheck="false"
			autocomplete="off"
			oninput={(event) => {
				draft = event.currentTarget.value;
				completion.reset();
			}}
			onkeydown={handleKeydown}
			onblur={() => (view.editingPath = false)}
		/>
		{#if completion.candidates.length > 0}
			<div class="path-candidates soft-scroll" role="listbox" aria-label="Matching folders" tabindex="-1" onpointerdown={(event) => event.preventDefault()}>
				{#each completion.candidates as name, index (name)}
					<button
						class={['path-candidate', index === completion.index && 'is-active']}
						type="button"
						role="option"
						aria-selected={index === completion.index}
						onclick={() => choose(name)}
					>
						<Folder size={15} />
						<span class="truncate">{name}</span>
					</button>
				{/each}
			</div>
		{/if}
	{:else}
		<div
			bind:this={trail}
			bind:clientWidth={trailWidth}
			class={['path-trail hidden-scroll', clipped && 'is-clipped']}
			role="group"
			aria-label="Location"
			onscroll={() => (clipped = (trail?.scrollLeft ?? 0) > 0)}
		>
			{#each crumbs as crumb, index (crumb.path || crumb.label)}
				{@const accepts = acceptsDrops && Boolean(crumb.path) && drag.canDropOn(crumb.path)}
				{#if index > 0}
					<ChevronRight size={14} class="path-separator" />
				{/if}
				<button
					class={['path-crumb', index === crumbs.length - 1 && 'is-current', drag.target?.key === segmentKey(crumb.path) && 'is-drop-target']}
					type="button"
					ondragover={(event) => accepts && drag.overPath(event, crumb.path, segmentKey(crumb.path))}
					ondragleave={drag.leave}
					ondrop={(event) => accepts && drag.drop(event, crumb.path)}
					onclick={() => open(crumb.path)}
				>
					{#if crumb.icon}
						<crumb.icon size={15} />
					{/if}
					<span class="truncate">{crumb.label}</span>
				</button>
			{/each}
		</div>
		{#if manager.view === 'home'}
			<button class="path-edit-area" type="button" aria-label="Edit location" onclick={() => (view.editingPath = true)}></button>
		{/if}
	{/if}
</div>
