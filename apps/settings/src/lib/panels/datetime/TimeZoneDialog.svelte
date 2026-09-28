<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { Dialog } from '@luft/ui';
	import { setTimezone, type Zone } from './api';
	import { city, country, offsetLabel, offsetMinutes, shortTime } from './zones';

	interface Props {
		zones: Zone[];
		current: string;
		minute: number;
		hour12: boolean;
		onclose: () => void;
	}

	let { zones, current, minute, hour12, onclose }: Props = $props();

	let query = $state('');
	let failed = $state(false);
	let list = $state<HTMLDivElement>();

	let entries = $derived(
		zones
			.map((zone) => {
				const offset = offsetMinutes(zone.id, minute);
				const name = city(zone.id);
				const place = country(zone.country) ?? 'Coordinated Universal Time';
				const label = offsetLabel(offset);
				return { id: zone.id, name, place, offset, label, search: `${name} ${place} ${zone.id.replaceAll('_', ' ')} ${label}`.toLowerCase() };
			})
			.sort((a, b) => a.offset - b.offset || a.name.localeCompare(b.name))
	);
	let needle = $derived(query.trim().toLowerCase());
	let shown = $derived(needle ? entries.filter((entry) => entry.search.includes(needle)) : entries);

	$effect(() => {
		const selected = list?.querySelector<HTMLElement>('[aria-selected="true"]');
		if (list && selected) list.scrollTop = selected.offsetTop - (list.clientHeight - selected.offsetHeight) / 2;
	});

	async function choose(zone: string) {
		if (zone === current) return onclose();
		failed = false;
		try {
			await setTimezone(zone);
			onclose();
		} catch {
			failed = true;
		}
	}
</script>

<Dialog title="Time zone" {onclose}>
	<input
		class="text-field"
		placeholder="Search for a city or country"
		bind:value={query}
		onkeydown={(event) => event.key === 'Enter' && shown[0] && choose(shown[0].id)}
	/>
	<div bind:this={list} class="zones soft-scroll" role="listbox" aria-label="Time zones">
		{#each shown as zone (zone.id)}
			<button type="button" role="option" aria-selected={zone.id === current} class="zone" onclick={() => choose(zone.id)}>
				<span class="flex min-w-0 flex-1 flex-col">
					<span class="truncate text-[14px] text-[var(--text)]">{zone.name}</span>
					<span class="truncate text-[12.5px] text-[var(--text-muted)]">{zone.place}</span>
				</span>
				<span class="flex flex-col items-end">
					<span class="text-[13px] tabular-nums">{shortTime(zone.id, minute, hour12)}</span>
					<span class="text-[12px] text-[var(--text-muted)]">{zone.label}</span>
				</span>
				<span class="check">
					{#if zone.id === current}
						<Check size={16} />
					{/if}
				</span>
			</button>
		{:else}
			<p class="px-3 py-6 text-center text-[13px] text-[var(--text-muted)]">No matching places</p>
		{/each}
	</div>
	{#if failed}
		<p class="text-[13px] text-[var(--danger)]">The time zone couldn't be changed.</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
	{/snippet}
</Dialog>

<style>
	.zones {
		position: relative;
		display: flex;
		height: 340px;
		flex-direction: column;
		gap: 2px;
		margin-inline: -8px;
		overflow-y: auto;
	}

	.zone {
		display: flex;
		align-items: center;
		gap: 12px;
		border-radius: 14px;
		padding: 8px 10px;
		text-align: left;
		color: var(--text-soft);
		transition: background-color 160ms var(--ease);
	}

	.zone:hover {
		background: var(--surface-hover);
	}

	.zone[aria-selected='true'] {
		background: var(--sidebar-active);
	}

	.check {
		display: grid;
		width: 16px;
		flex: none;
		place-items: center;
		color: var(--accent);
	}
</style>
