<script lang="ts">
	import { t } from '@luft/i18n';
	import { fontOf } from '#lib/raster/text.js';
	import type { TextTool } from '#lib/tools/text.svelte.js';
	import type { Viewport } from '#lib/viewport/viewport.svelte.js';

	let { tool, viewport }: { tool: TextTool; viewport: Viewport } = $props();
	let edit = $derived(tool.editing!);
	let position = $derived(viewport.toScreen(edit.style.x, edit.style.y));
</script>

<textarea
	class="editing"
	aria-label={t('easel-text-content')}
	style:left="{position[0]}px"
	style:top="{position[1]}px"
	style:font={fontOf({ ...edit.style, size: edit.style.size * viewport.scale })}
	style:color={edit.style.color}
	style:line-height="1.25"
	rows={Math.max(1, edit.style.content.split('\n').length)}
	value={edit.style.content}
	spellcheck="false"
	{@attach (node) => node.focus()}
	onpointerdown={(event) => event.stopPropagation()}
	oninput={(event) => (edit.style.content = event.currentTarget.value)}
	onkeydown={(event) => {
		event.stopPropagation();
		if (event.key === 'Escape') tool.commit();
	}}
></textarea>

<style>
	.editing {
		position: absolute;
		min-width: 40px;
		field-sizing: content;
		resize: none;
		overflow: hidden;
		white-space: pre;
		background: transparent;
		outline: 1.5px dashed rgba(255, 255, 255, 0.8);
		outline-offset: 4px;
		caret-color: currentColor;
	}
</style>
