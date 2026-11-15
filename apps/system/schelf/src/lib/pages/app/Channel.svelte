<script lang="ts">
	import { t } from '@luft/i18n';
	import { errorText, Row, Section, Segmented } from '@luft/ui';
	import { channelName } from '#lib/account/channels.js';
	import type { StoreDetails } from '#lib/bindings.js';
	import { follow } from '#lib/catalog/store.js';
	import type { AppDetails } from '#lib/catalog/types.js';
	import { library } from '#lib/state/library.svelte.js';

	let { store, installed, onchange }: { store: StoreDetails; installed: boolean; onchange: (details: AppDetails) => void } = $props();

	const PREVIEWS: Record<string, string> = {
		beta: 'app-channel-beta',
		nightly: 'app-channel-nightly'
	};

	let problem = $state('');
	let changing = $state(false);

	const WITH_SYSTEM = 'system';

	const options = $derived(store.choices.map((choice) => ({ value: choice, label: choice === WITH_SYSTEM ? t('app-channel-with-luft') : channelName(choice) })));
	const withSystem = $derived(store.choice === WITH_SYSTEM);
	const ended = $derived(store.endedChannel);
	const onOtherChannel = $derived(store.releaseChannel !== null && store.releaseChannel !== store.channel);
	const invited = $derived(store.invited.includes(store.channel));
	const about = $derived.by(() => {
		if (invited) return store.developer ? t('app-channel-invited', { developer: store.developer }) : t('app-channel-invited-anyone');
		return store.channel in PREVIEWS ? t(PREVIEWS[store.channel]) : null;
	});
	const description = $derived(
		[
			ended ? t('app-channel-ended', { ended: channelName(ended), channel: channelName(store.channel) }) : null,
			withSystem && !ended ? t('app-channel-luft', { channel: channelName(store.channel) }) : about,
			onOtherChannel ? t('app-channel-newest', { channel: store.releaseChannel ?? '' }) : null,
			installed && ended ? t('app-channel-keep-ended', { channel: channelName(store.channel) }) : null,
			installed && !ended && store.channel !== 'stable' ? t('app-channel-keep-stable') : null
		]
			.filter(Boolean)
			.join(' ') || undefined
	);

	async function choose(choice: string) {
		if (changing || choice === store.choice) return;
		problem = '';
		changing = true;
		try {
			onchange(await follow(store.id, choice));
			if (installed) void library.check();
		} catch (reason) {
			problem = errorText(reason);
		} finally {
			changing = false;
		}
	}
</script>

<Section title={t('app-versions')}>
	<Row title={t('app-channel')} {description}>
		<Segmented label={t('app-channel')} {options} value={store.choice} onchange={choose} />
	</Row>
</Section>
{#if problem}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
{/if}
