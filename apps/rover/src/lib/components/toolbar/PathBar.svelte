<script lang="ts">
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import type { DragController } from '$lib/file-manager/drag/controller.svelte';
	import { dropKey } from '$lib/file-manager/drag/drop-targets';
	import { PathCompletion } from '$lib/file-manager/location/completion.svelte';
	import { expandHome } from '$lib/file-manager/location/expand';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import type { ViewState } from '$lib/file-manager/view/view-state.svelte';
	import { isInside, pathSegments, trimTrailingSlash } from '$lib/utils/paths';

	interface Props {
		manager: FileManager;
		drag: DragController;
		view: ViewState;
		acceptsDrops: boolean;
	}

	let { manager, drag, view, acceptsDrops }: Props = $props();

	type Crumb = { path: string; label: string; icon?: IconName };

	const VIEW_CRUMBS: Record<'recent' | 'trash', Crumb> = {
		recent: { path: '', label: 'Recent', icon: 'clock' },
		trash: { path: '', label: 'Trash', icon: 'trash' }
	};

	const completion = new PathCompletion(() => manager.homePath);

	let trail = $state<HTMLDivElement>();
	let draft = $state('');
	let clipped = $state(false);
	let trailWidth = $state(0);

	let root = $derived.by((): Crumb => {
		const path = manager.currentPath;
		if (isInside(path, manager.homePath)) return { path: manager.homePath, label: 'Home', icon: 'home' };
		const drive = manager.drives.holding(path);
		if (!drive) return { path: '/', label: 'Computer', icon: 'hard-drive' };
		return { path: drive.mount_point, label: drive.name, icon: drive.is_removable ? 'usb' : 'hard-drive' };
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
		if (view.editingPath) draft = manager.currentPath || manager.homePath;
		else completion.forget();
	});

	function focusInput(input: HTMLInputElement) {
		input.focus();
		input.select();
	}

	function commit() {
		view.editingPath = false;
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
						<Icon name="folder" size={15} />
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
					<Icon name="chevron-right" size={14} class="path-separator" />
				{/if}
				<button
					class={['path-crumb', index === crumbs.length - 1 && 'is-current', drag.target?.key === segmentKey(crumb.path) && 'is-drop-target']}
					type="button"
					data-drop-path={accepts ? crumb.path : undefined}
					data-drop-key={accepts ? segmentKey(crumb.path) : undefined}
					ondragover={(event) => accepts && drag.overPath(event, crumb.path, segmentKey(crumb.path))}
					ondragleave={drag.leave}
					ondrop={(event) => accepts && drag.drop(event, crumb.path)}
					onclick={() => open(crumb.path)}
				>
					{#if crumb.icon}
						<Icon name={crumb.icon} size={15} />
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
