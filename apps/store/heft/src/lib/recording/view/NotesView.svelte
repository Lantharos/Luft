<script lang="ts">
	import { t } from '@luft/i18n';
	import { formatClock } from '@luft/ui';
	import type { Notes } from '#lib/bindings.js';
	import { player } from '../player.svelte';
	import type { Transcript } from '../transcript';

	let { transcript, onedit }: { transcript: Transcript; onedit: () => void } = $props();

	const FIELD_LABELS = {
		text: 'notes-field-text',
		term: 'notes-field-term',
		meaning: 'notes-field-meaning',
		task: 'notes-field-task',
		due: 'notes-field-due',
		question: 'notes-field-question',
		answer: 'notes-field-answer'
	} as const;
	type Field = keyof typeof FIELD_LABELS;
	type Item = { at: number } & Partial<Record<Field, string | null>>;

	let sections = $derived.by(() => {
		const all = (key: keyof Notes) => transcript.notes.parts.flatMap((part) => part[key] as Item[]);
		return [
			{ title: t('notes-points'), items: all('points'), fields: ['text'] as Field[] },
			{ title: t('notes-definitions'), items: all('definitions'), fields: ['term', 'meaning'] as Field[] },
			{ title: t('notes-homework'), items: all('homework'), fields: ['task', 'due'] as Field[] },
			{ title: t('notes-questions'), items: all('questions'), fields: ['question', 'answer'] as Field[] }
		].filter((section) => section.items.length);
	});

	function edit(item: Item, field: Field, element: HTMLElement) {
		const text = element.innerText.trim();
		if ((item[field] ?? '') === text) return;
		item[field] = text || null;
		onedit();
	}
</script>

{#if transcript.notes.heading}
	<header class="flex flex-col gap-1 px-2">
		<h2 class="text-[17px] font-semibold">{transcript.notes.heading.title}</h2>
		<p class="text-[13px] leading-relaxed text-(--text-soft)">{transcript.notes.heading.summary}</p>
	</header>
{/if}
{#each sections as section (section.title)}
	<section class="flex flex-col gap-1">
		<h3 class="px-2 text-[13px] font-semibold text-(--text-soft)">{section.title}</h3>
		<ul class="flex flex-col gap-0.5">
			{#each section.items as item, index (index)}
				<li class="item">
					<button type="button" class="time tabular-nums" aria-label={t('notes-play-from', { time: formatClock(item.at / 1000) })} onclick={() => player.seek(item.at)}>
						{formatClock(item.at / 1000)}
					</button>
					<span class="min-w-0 flex-1">
						{#each section.fields as field, place (field)}
							{#if item[field] || place === 0}
								<span
									class="field"
									class:lead={place === 0 && section.fields.length > 1}
									contenteditable="plaintext-only"
									role="textbox"
									tabindex="0"
									aria-label={t(FIELD_LABELS[field])}
									onblur={(event) => edit(item, field, event.currentTarget)}>{item[field] ?? ''}</span
								>
							{/if}
						{/each}
					</span>
				</li>
			{/each}
		</ul>
	</section>
{:else}
	<p class="px-2 text-[13px] text-(--text-muted)">{transcript.notes.done ? t('notes-nothing') : t('notes-empty')}</p>
{/each}

<style>
	.item {
		display: flex;
		gap: 10px;
		border-radius: 10px;
		padding: 6px 8px;
		font-size: 13.5px;
		line-height: 1.45;
	}

	.time {
		flex: none;
		width: 40px;
		height: 20px;
		border-radius: 6px;
		color: var(--accent);
		font-size: 12px;
		text-align: left;
	}

	.time:hover {
		text-decoration: underline;
	}

	.field {
		display: block;
		border-radius: 4px;
		outline: none;
	}

	.field.lead {
		font-weight: 600;
	}

	.field:focus {
		box-shadow: 0 0 0 1px color-mix(in oklab, var(--accent) 70%, transparent);
	}
</style>
