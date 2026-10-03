<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import type { LayoutEditor } from './editor.svelte';
	import { issues, type Target } from './issues';

	interface Props {
		editor: LayoutEditor;
	}

	let { editor }: Props = $props();

	let found = $derived(issues(editor.layout, editor.geometry, editor.usesThirdLevel));

	function open(target: Target) {
		editor.tab = target.tab;
		if (target.tab === 'keys') editor.select(target.key, target.level);
		else if (target.tab === 'dead') editor.chosenDead = target.keysym;
	}
</script>

{#if found.length}
	<Section title="Worth a look">
		{#each found as issue (issue.id)}
			<Row title={issue.text} onclick={() => open(issue.target)} />
		{/each}
	</Section>
{/if}
