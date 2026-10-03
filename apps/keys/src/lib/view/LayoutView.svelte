<script lang="ts">
	import { onMount } from 'svelte';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { MenuButton } from '@luft/ui';
	import { PHYSICAL, TYPING } from '#lib/keyboard/geometry.js';
	import Keyboard from '#lib/keyboard/Keyboard.svelte';
	import ShapeItems from '#lib/keyboard/ShapeItems.svelte';
	import { viewLayout } from '#lib/layout/api.js';
	import Page from '#lib/shell/Page.svelte';
	import { app } from '#lib/state/app.svelte.js';
	import { toast } from '#lib/state/toast.svelte.js';
	import KeyLevels from './KeyLevels.svelte';
	import { LayoutViewer } from './viewer.svelte';

	interface Props {
		id: string;
	}

	let { id }: Props = $props();

	let viewer = $state<LayoutViewer | null>(null);
	let custom = $state(false);

	onMount(() => {
		viewLayout(id)
			.then(({ custom: editable, ...layout }) => {
				custom = editable;
				viewer = new LayoutViewer(layout, app.sources.find(([type]) => type === 'xkb')?.[1] ?? null);
			})
			.catch((error) => {
				toast.failed(error);
				app.select(app.first());
			});
	});

	function key(event: KeyboardEvent, down: boolean) {
		const name = PHYSICAL[event.code];
		if (!viewer || !name || app.creating || event.repeat) return;
		viewer.press(name, down);
		if (!TYPING.has(name) || event.ctrlKey || event.metaKey) return;
		event.preventDefault();
		if (down) viewer.select(name);
	}
</script>

<svelte:window onkeydown={(event) => key(event, true)} onkeyup={(event) => key(event, false)} onblur={() => viewer?.release()} />

{#if viewer}
	{@const current = viewer}
	<Page title={current.layout.name}>
		{#snippet actions()}
			{#if custom}
				<button type="button" class="button" onclick={() => app.select({ kind: 'layout', id })}>Edit</button>
			{:else}
				<button type="button" class="button" onclick={() => (app.creating = { kind: 'layout', from: id })}>Make a copy to edit</button>
			{/if}
			<MenuButton label="More" class="icon-button" align="end" minWidth={200}>
				{#snippet trigger()}
					<Ellipsis size={18} />
				{/snippet}
				{#snippet children(close)}
					<ShapeItems value={current.geometry} onchange={(geometry) => current.setGeometry(geometry)} {close} />
				{/snippet}
			</MenuButton>
		{/snippet}
		<section class="flex flex-col gap-6 pt-4">
			<Keyboard board={current} level={current.level || null} onlatch={(name) => current.latch(name)} />
			<KeyLevels levels={current.levels(current.selected)} level={current.level} thirdLevel={current.usesThirdLevel} dead={current.layout.dead} />
		</section>
	</Page>
{/if}
