<script lang="ts">
	import { untrack } from 'svelte';
	import type { TerminalSession } from '$lib/terminal/session.svelte';
	import type { Workspace } from '$lib/workspace/workspace.svelte';
	import SearchBar from './SearchBar.svelte';

	interface Props {
		session: TerminalSession;
		workspace: Workspace;
		visible: boolean;
		split: boolean;
	}

	let { session, workspace, visible, split }: Props = $props();

	let container = $state<HTMLDivElement>();
	let flashing = $state(false);
	let focused = $derived(workspace.focused === session);

	$effect(() => {
		if (!container) return;
		session.attach(container);
		const current = session;
		let frame = 0;
		const observer = new ResizeObserver(() => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => current.fit());
		});
		observer.observe(container);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			current.host.remove();
		};
	});

	$effect(() => session.setVisible(visible));

	let heardBells = untrack(() => session.bells);

	$effect(() => {
		if (session.bells === heardBells) return;
		heardBells = session.bells;
		flashing = true;
		const timer = setTimeout(() => (flashing = false), 180);
		return () => clearTimeout(timer);
	});
</script>

<div
	class="pane"
	class:dimmed={split && !focused}
	role="presentation"
	onpointerdown={() => workspace.focusSession(session)}
	oncontextmenu={(event) => {
		event.preventDefault();
		workspace.focusSession(session);
		workspace.menu = { session, x: event.clientX, y: event.clientY };
	}}
>
	<div class="pane-terminal" bind:this={container}></div>
	{#if workspace.searching === session}
		<SearchBar {session} onclose={() => (workspace.searching = null)} />
	{/if}
	<div class="bell" class:flashing></div>
</div>
