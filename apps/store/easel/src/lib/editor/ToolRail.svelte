<script lang="ts">
	import { toolLabel } from '#lib/app/labels.js';
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import ColorWells from './ColorWells.svelte';
	import type { Editor } from './editor.svelte';
	import { TOOLS } from './tools';

	let { editor }: { editor: Editor } = $props();
</script>

<nav class="glass-sidebar drag-region items-center gap-1 py-2.5" aria-label={t('easel-tools')}>
	{#each TOOLS as tool (tool.id)}
		<button
			type="button"
			class={['tool', editor.settings.tool === tool.id && 'is-active']}
			aria-label={toolLabel[tool.id]()}
			aria-pressed={editor.settings.tool === tool.id}
			onclick={() => editor.choose(tool.id)}
			{@attach tooltip(toolLabel[tool.id]())}
		>
			<tool.icon size={19} />
		</button>
	{/each}
	<div class="flex-1"></div>
	<ColorWells settings={editor.settings} />
</nav>

<style>
	.tool {
		display: grid;
		height: 40px;
		width: 40px;
		flex: none;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--sidebar-text-muted);
		transition: background-color var(--motion-tap) var(--ease-decelerate), color var(--motion-tap) var(--ease-decelerate);
	}

	.tool:hover {
		background: var(--sidebar-control-hover);
		color: var(--sidebar-text);
	}

	.tool.is-active {
		background: var(--sidebar-active);
		color: var(--sidebar-active-text);
		box-shadow: var(--sidebar-active-shadow);
	}
</style>
