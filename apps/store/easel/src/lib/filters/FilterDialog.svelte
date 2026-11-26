<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Slider } from '@luft/ui';
	import { untrack } from 'svelte';
	import type { ImageDocument } from '#lib/document/image.svelte.js';
	import { filterFields, filterName, type FilterKind } from './filters';
	import { FilterSession } from './session';

	let { doc, kind, onclose }: { doc: ImageDocument; kind: FilterKind; onclose: () => void } = $props();

	const fields = untrack(() => filterFields(kind));
	const session = untrack(() => new FilterSession(doc, doc.active, kind));
	let values = $state(Object.fromEntries(fields.map((field) => [field.key, field.value])));
	let frame = 0;

	function schedule() {
		frame ||= requestAnimationFrame(() => {
			frame = 0;
			session.update($state.snapshot(values));
		});
	}

	schedule();

	function finish(keep: boolean) {
		cancelAnimationFrame(frame);
		if (keep) session.apply(filterName[kind]());
		else session.cancel();
		onclose();
	}
</script>

<Dialog title={filterName[kind]()} onclose={() => finish(false)}>
	<div class="flex flex-col gap-4 px-2.5 py-2.5">
		{#each fields as field (field.key)}
			<div class="flex flex-col gap-2">
				<div class="flex justify-between text-[13px]"><span>{field.label()}</span><span class="text-(--text-muted) tabular-nums">{values[field.key]}</span></div>
				<Slider label={field.label()} value={values[field.key]} min={field.min} max={field.max} step={field.step} oninput={(value) => ((values[field.key] = value), schedule())} onchange={(value) => ((values[field.key] = value), schedule())} />
			</div>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={() => finish(false)}>{t('easel-cancel')}</button>
		<button type="button" class="button primary" onclick={() => finish(true)}>{t('easel-apply')}</button>
	{/snippet}
</Dialog>
