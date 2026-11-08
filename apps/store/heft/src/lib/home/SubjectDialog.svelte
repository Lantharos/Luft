<script lang="ts">
	import { untrack } from 'svelte';
	import Check from '@lucide/svelte/icons/check';
	import { i18n, t } from '@luft/i18n';
	import { Dialog, MultiChoice, TextField } from '@luft/ui';
	import { CLASS_LANGUAGES, spokenIn } from '#lib/recording/languages.js';
	import { focusField } from '#lib/shell/dialogs/focus.js';
	import { library, SUBJECT_COLORS, type SubjectEntry } from '#lib/library/library.svelte.js';

	let { subject, onclose }: { subject?: SubjectEntry; onclose: () => void } = $props();

	let name = $state(untrack(() => subject?.meta.name ?? ''));
	let color = $state(untrack(() => subject?.meta.color ?? SUBJECT_COLORS[library.subjects.length % SUBJECT_COLORS.length]));
	const names = new Intl.DisplayNames([i18n.locale], { type: 'language' });
	let languages = $state(untrack(() => spokenIn(subject?.meta)));
	let trimmed = $derived(name.trim());

	async function save() {
		if (!trimmed) return;
		const spoken = languages.join() === spokenIn().join() ? undefined : languages;
		if (subject) await library.updateSubject(subject, { name: trimmed, color, languages: spoken });
		else {
			const created = await library.createSubject(trimmed, color);
			if (spoken) await library.updateSubject(created, { languages: spoken });
			await library.createNotebook(created, t('default-notebook'));
		}
		onclose();
	}
</script>

<Dialog title={subject ? t('subject-edit-title') : t('subject-new-title')} description={subject ? undefined : t('subject-new-body')} {onclose}>
	<form id="subject-dialog" {@attach focusField} class="flex flex-col gap-4" onsubmit={(event) => (event.preventDefault(), void save())}>
		<TextField bind:value={name} label={t('subject-name')} placeholder={t('subject-name-example')} />
		<div class="flex flex-wrap gap-2" role="radiogroup" aria-label={t('subject-color')}>
			{#each SUBJECT_COLORS as option (option)}
				<button type="button" class="swatch" role="radio" aria-checked={color === option} aria-label={option} style:background={option} onclick={() => (color = option)}>
					{#if color === option}<Check size={16} strokeWidth={2.6} />{/if}
				</button>
			{/each}
		</div>
		<div class="flex flex-col gap-2">
			<p class="text-[13.5px]">{t('subject-languages')}</p>
			<MultiChoice
				label={t('subject-languages')}
				value={languages}
				least={1}
				options={[...new Set([...CLASS_LANGUAGES, ...spokenIn()])].map((language) => ({ value: language, label: names.of(language) ?? language }))}
				onchange={(value) => (languages = value)}
			/>
			<p class="text-[12px] text-(--text-muted)">{t('subject-languages-body')}</p>
		</div>
	</form>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="submit" form="subject-dialog" class="button primary" disabled={!trimmed}>{subject ? t('dialog-save') : t('subject-create')}</button>
	{/snippet}
</Dialog>

<style>
	.swatch {
		display: grid;
		height: 34px;
		width: 34px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: white;
	}

	.swatch[aria-checked='true'] {
		box-shadow:
			0 0 0 2px var(--popover),
			0 0 0 4px var(--accent-line);
	}
</style>
