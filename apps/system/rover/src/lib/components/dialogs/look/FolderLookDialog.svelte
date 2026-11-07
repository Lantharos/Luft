<script lang="ts">
	import { Dialog, errorText, plural, tooltip } from '@luft/ui';
	import { untrack } from 'svelte';
	import type { FileEntry } from '#lib/bindings.js';
	import { COLORS, ICONS, tint } from '#lib/features/looks/catalogue.js';
	import { folderLooks } from '#lib/features/looks/looks.svelte.js';

	interface Props {
		entries: FileEntry[];
		onclose: () => void;
	}

	let { entries, onclose }: Props = $props();

	const first = untrack(() => entries[0].path);
	const fallback = folderLooks.defaultIcon(first);
	const current = folderLooks.look(first);

	let icon = $state(current?.icon ?? fallback);
	let color = $state<string | null>(current?.color ?? null);
	let error = $state<string | null>(null);

	let custom = $derived(entries.some((entry) => folderLooks.look(entry.path)));
	let title = $derived(entries.length === 1 ? `Icon for “${entries[0].name}”` : `Icon for ${plural(entries.length, 'folder')}`);

	async function apply(look: { icon: string | null; color: string | null } | null) {
		try {
			await folderLooks.set(
				entries.map((entry) => entry.path),
				look
			);
			onclose();
		} catch (caught) {
			error = errorText(caught);
		}
	}

	function save() {
		const chosen = { icon: icon === fallback ? null : icon, color };
		void apply(chosen.icon || chosen.color ? chosen : null);
	}
</script>

<Dialog {title} {onclose}>
	<div class="colors" role="radiogroup" aria-label="Color">
		<button
			type="button"
			role="radio"
			class="swatch"
			aria-checked={color === null}
			aria-label="Default"
			style:--swatch="var(--folder)"
			onclick={() => (color = null)}
			{@attach tooltip('Default')}
		></button>
		{#each COLORS as option (option.name)}
			<button
				type="button"
				role="radio"
				class="swatch"
				aria-checked={color === option.name}
				aria-label={option.label}
				style:--swatch={tint(option.name)}
				onclick={() => (color = option.name)}
				{@attach tooltip(option.label)}
			></button>
		{/each}
	</div>
	<div class="icons" role="radiogroup" aria-label="Icon" style:--tint={tint(color)}>
		{#each Object.entries(ICONS) as [name, option] (name)}
			<button
				type="button"
				role="radio"
				class="icon-choice"
				aria-checked={icon === name}
				aria-label={option.label}
				onclick={() => (icon = name)}
				{@attach tooltip(option.label)}
			>
				<option.icon size={20} />
			</button>
		{/each}
	</div>
	{#if error}
		<p class="text-[12px] text-[var(--danger)]">{error}</p>
	{/if}

	{#snippet actions()}
		{#if custom}
			<button class="button mr-auto" type="button" onclick={() => apply(null)}>Reset</button>
		{/if}
		<button class="button" type="button" onclick={onclose}>Cancel</button>
		<button class="button primary" type="button" onclick={save}>Save</button>
	{/snippet}
</Dialog>

<style>
	.colors {
		display: flex;
		gap: 8px;
		padding: 4px;
	}

	.swatch {
		height: 26px;
		width: 26px;
		border-radius: var(--radius-pill);
		background: var(--swatch);
		box-shadow: inset 0 0 0 1px var(--hairline);
		transition: box-shadow var(--motion-tap) var(--ease-decelerate);
	}

	.swatch[aria-checked='true'] {
		box-shadow:
			inset 0 0 0 2px var(--text),
			inset 0 0 0 4px var(--popover);
	}

	.swatch:focus-visible,
	.icon-choice:focus-visible {
		outline-offset: -2px;
	}

	.icons {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 4px;
		padding: 2px;
	}

	.icon-choice {
		display: grid;
		aspect-ratio: 1;
		place-items: center;
		border-radius: 12px;
		color: var(--text-soft);
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate),
			transform var(--motion-tap) var(--ease-decelerate);
	}

	.icon-choice:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.icon-choice:active {
		transform: scale(0.94);
	}

	.icon-choice[aria-checked='true'] {
		background: color-mix(in srgb, var(--tint, var(--folder)) 14%, transparent);
		color: var(--tint, var(--folder));
	}
</style>
