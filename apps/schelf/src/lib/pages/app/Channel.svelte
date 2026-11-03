<script lang="ts">
	import { errorText, Row, Section, Segmented } from '@luft/ui';
	import type { StoreDetails } from '#lib/bindings.js';
	import { follow } from '#lib/catalog/store.js';
	import type { AppDetails } from '#lib/catalog/types.js';
	import { library } from '#lib/state/library.svelte.js';

	let { store, installed, onchange }: { store: StoreDetails; installed: boolean; onchange: (details: AppDetails) => void } = $props();

	const PREVIEWS: Record<string, string> = {
		beta: 'Previews of the next version. They can have bugs, so keep a copy of anything important.',
		nightly: 'Built from the newest code, often every day. They can break, and they reach you after automatic checks without anyone looking at them first.'
	};

	let problem = $state('');
	let changing = $state(false);

	const label = (channel: string) => channel.charAt(0).toUpperCase() + channel.slice(1);
	const options = $derived(store.channels.map((channel) => ({ value: channel, label: label(channel) })));
	const description = $derived(
		[PREVIEWS[store.channel], installed && store.channel !== 'stable' ? 'Going back to Stable keeps the version you have until a stable one is newer.' : null].filter(Boolean).join(' ') || undefined
	);

	async function choose(channel: string) {
		if (changing || channel === store.channel) return;
		problem = '';
		changing = true;
		try {
			onchange(await follow(store.id, channel));
			if (installed) void library.check();
		} catch (reason) {
			problem = errorText(reason);
		} finally {
			changing = false;
		}
	}
</script>

<Section title="Versions">
	<Row title="Channel" {description}>
		<Segmented label="Channel" {options} value={store.channel} onchange={choose} />
	</Row>
</Section>
{#if problem}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
{/if}
