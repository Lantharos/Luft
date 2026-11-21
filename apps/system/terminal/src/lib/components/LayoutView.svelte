<script lang="ts">
	import type { LayoutNode } from '#lib/workspace/layout.js';
	import type { Workspace } from '#lib/workspace/workspace.svelte.js';
	import LayoutView from './LayoutView.svelte';
	import SplitDivider from './SplitDivider.svelte';
	import TerminalPane from './TerminalPane.svelte';

	interface Props {
		node: LayoutNode;
		workspace: Workspace;
		visible: boolean;
		split?: boolean;
	}

	let { node, workspace, visible, split = false }: Props = $props();
</script>

{#if node.kind === 'pane'}
	<TerminalPane session={node.session} {workspace} {visible} {split} />
{:else}
	<div class="split" class:column={node.direction === 'column'}>
		<div class="split-part" style:flex-grow={node.ratio}>
			<LayoutView node={node.first} {workspace} {visible} split />
		</div>
		<SplitDivider {node} />
		<div class="split-part" style:flex-grow={1 - node.ratio}>
			<LayoutView node={node.second} {workspace} {visible} split />
		</div>
	</div>
{/if}
