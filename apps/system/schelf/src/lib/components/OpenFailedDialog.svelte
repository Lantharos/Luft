<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import type { Failed } from '#lib/state/opening.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';

	let { failed, onclose }: { failed: Failed; onclose: () => void } = $props();

	const failure = $derived(failed.failure);
	const missing = $derived(failure?.missing ?? null);
	const needed = $derived(missing ? t('open-failed-need', { kind: missing.kind, name: missing.name }) : null);
	const description = $derived.by(() => {
		if (!failure) return failed.error ?? undefined;
		if (needed && failure.package) return t('open-failed-missing-package', { needed, package: failure.package });
		if (needed) return t('open-failed-missing', { needed });
		return failure.crashed ? t('open-failed-crashed') : t('open-failed-closed');
	});

	function add(name: string) {
		void operations.run(failed.app.key, failed.app.name, { kind: 'installSystemPackages', packages: [name] });
		onclose();
	}
</script>

<Dialog title={t('open-failed-title', { name: failed.app.name })} {description} {onclose}>
	{#if failure && !failure.package && failure.output.length}
		<div class="flex flex-col gap-2">
			<span class="text-[13px] text-[var(--text-muted)]">{t('open-failed-output')}</span>
			<pre class="output">{failure.output.join('\n')}</pre>
		</div>
	{/if}
	{#snippet actions()}
		{#if failure?.package}
			{@const name = failure.package}
			<button type="button" class="button" onclick={onclose}>{t('open-failed-cancel')}</button>
			<button type="button" class="button primary" onclick={() => add(name)}>{t('open-failed-add', { name })}</button>
		{:else}
			<button type="button" class="button primary" onclick={onclose}>{t('open-failed-close')}</button>
		{/if}
	{/snippet}
</Dialog>

<style>
	.output {
		max-height: 220px;
		overflow: auto;
		border-radius: var(--radius-group);
		background: var(--control);
		padding: 10px 12px;
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1.5;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		color: var(--text-soft);
	}
</style>
