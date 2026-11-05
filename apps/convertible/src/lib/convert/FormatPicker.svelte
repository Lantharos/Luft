<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import type { Family, FileEntry, Target } from '#lib/bindings.js';
	import { capabilities } from '#lib/state/capabilities.svelte.js';
	import { familyName, missingReason } from '#lib/state/formats.js';
	import { session } from '#lib/state/session.svelte.js';

	interface Props {
		family: Family;
		titled: boolean;
	}

	let { family, titled }: Props = $props();

	let expanded = $state(false);

	const files = $derived(session.files.filter((file) => file.family === family));
	const shared = $derived(sharedTargets(files));
	const suggested = $derived(shared.slice(0, files[0]?.suggested ?? 3));
	const others = $derived(shared.slice(suggested.length));
	const chosen = $derived(session.choices[family]);
	const shown = $derived(expanded ? shared : chosen && others.some((target) => target.id === chosen) ? [...suggested, others.find((target) => target.id === chosen)!] : suggested);
	const missing = $derived(shown.filter((target) => capabilities.missing(target.id)));

	function sharedTargets(entries: FileEntry[]): Target[] {
		const [first, ...rest] = entries;
		if (!first) return [];
		return first.targets.filter((target) => rest.every((file) => file.targets.some((other) => other.id === target.id)));
	}
</script>

<section class="flex flex-col gap-2" aria-label={t('pick-format-for', { family: familyName(family) })}>
	<h2 class="text-[13px] font-semibold text-[var(--text-soft)]">
		{titled ? t('pick-format-family', { family: familyName(family) }) : t('pick-format')}
	</h2>
	<div class="flex flex-wrap gap-1.5" role="radiogroup">
		{#each shown as target (target.id)}
			{@const unavailable = capabilities.missing(target.id)}
			<button
				type="button"
				class="chip"
				class:chosen={chosen === target.id}
				role="radio"
				aria-checked={chosen === target.id}
				disabled={unavailable}
				{@attach tooltip(unavailable ? missingReason(target.id) : '')}
				onclick={() => session.choose(family, target.id)}
			>
				{target.label}
			</button>
		{/each}
		{#if others.length}
			<button type="button" class="chip quiet" aria-expanded={expanded} onclick={() => (expanded = !expanded)}>
				{expanded ? t('pick-fewer') : t('pick-more')}
				<ChevronDown size={14} style={expanded ? 'transform: rotate(180deg)' : ''} />
			</button>
		{/if}
	</div>
	{#each missing as target (target.id)}
		<p class="text-[12px] leading-[1.4] text-[var(--text-muted)]">{missingReason(target.id)}</p>
	{/each}
</section>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		min-height: 32px;
		padding: 0 12px;
		border-radius: var(--radius-pill);
		background: var(--surface);
		font-size: 13px;
		font-weight: 500;
		transition: background-color 120ms ease;
	}

	.chip:hover:not(:disabled) {
		background: var(--surface-hover);
	}

	.chip:disabled {
		color: var(--text-muted);
		opacity: 0.55;
	}

	.chip.quiet {
		background: transparent;
		color: var(--text-muted);
	}

	.chip.chosen {
		background: var(--accent);
		color: var(--accent-text);
	}

	.chip:focus-visible {
		outline: 2px solid var(--control-focus);
		outline-offset: 1px;
	}
</style>
