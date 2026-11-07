<script lang="ts">
	import { t } from '@luft/i18n';
	import { editor } from '#lib/state/editor.svelte.js';
	import { session } from '#lib/state/session.svelte.js';
	import Canvas from './Canvas.svelte';
	import Timeline from './Timeline.svelte';
	import Toolbar from './Toolbar.svelte';
	import { Spinner } from '@luft/ui';

	$effect(() => {
		if (session.current) void editor.open(session.current);
	});
</script>

<section class="flex min-h-0 min-w-0 flex-1 flex-col" aria-label={t('edit-area')}>
	{#if editor.failed}
		<p class="m-auto max-w-[420px] px-6 text-center text-[14px] text-[var(--text-soft)]">{editor.failed}</p>
	{:else if editor.visual}
		<Toolbar />
		<div class="flex min-h-0 flex-1 px-3 pb-3">
			{#if editor.preview}
				<Canvas />
			{:else}
				<p class="m-auto flex items-center gap-2 text-[13px] text-[var(--text-muted)]"><Spinner size={14} />{t('edit-loading')}</p>
			{/if}
		</div>
	{:else if !editor.timed}
		<p class="m-auto max-w-[420px] px-6 text-center text-[14px] text-[var(--text-soft)]">{t('edit-not-editable')}</p>
	{/if}
	{#if editor.timed && editor.duration > 0}
		<div class={editor.visual ? '' : 'my-auto'}>
			<Timeline tall={!editor.visual} />
		</div>
	{/if}
</section>
