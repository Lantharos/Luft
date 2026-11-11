<script lang="ts">
	import { t } from '@luft/i18n';
	import { ConfirmDialog, Row } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Activity, Channel, ChannelChoice, StableRelease } from '#lib/bindings.js';
	import Progress from './Progress.svelte';

	interface Props {
		choice: ChannelChoice;
		activity: Activity;
		attempt: (action: () => Promise<unknown>) => void;
	}

	let { choice, activity, attempt }: Props = $props();

	const CHANNELS: Channel[] = ['stable', 'nightly'];
	const TITLES: Record<Channel, string> = { stable: 'settings-updates-channel-stable', nightly: 'settings-updates-channel-nightly' };
	const DESCRIPTIONS: Record<Channel, string> = {
		stable: 'settings-updates-channel-stable-description',
		nightly: 'settings-updates-channel-nightly-description'
	};
	const WAITING: Record<Channel, string> = { stable: 'settings-updates-channel-waiting-stable', nightly: 'settings-updates-channel-waiting-nightly' };
	const CONFIRM = {
		stable: { title: 'settings-updates-stable-confirm-title', body: 'settings-updates-stable-confirm-body', action: 'settings-updates-stable-confirm' },
		nightly: { title: 'settings-updates-nightly-confirm-title', body: 'settings-updates-nightly-confirm-body', action: 'settings-updates-nightly-confirm' }
	};

	let stable = $state<StableRelease | null>(null);
	let confirming = $state<Channel | null>(null);

	const busy = $derived(activity.running !== null);
	const unavailable = (channel: Channel) => channel === 'stable' && stable !== 'released';

	function describe(channel: Channel) {
		if (channel === choice.chosen) return t(choice.waiting ? WAITING[channel] : DESCRIPTIONS[channel]);
		if (channel === 'stable' && stable === 'notYet') return t('settings-updates-channel-stable-none');
		if (channel === 'stable' && stable === 'unknown') return t('settings-updates-channel-stable-unknown');
		return t(DESCRIPTIONS[channel]);
	}

	void commands.updatesStableRelease().then((answer) => (stable = answer));
</script>

{#snippet progress()}
	<Progress {activity} />
{/snippet}

{#each CHANNELS as channel (channel)}
	{@const moving = activity.running === 'channel' && activity.target === channel}
	<Row title={t(TITLES[channel])} description={describe(channel)} below={moving ? progress : undefined}>
		{#if moving}
			<button type="button" class="button" onclick={() => attempt(commands.updatesCancel)}>{t('settings-updates-stop')}</button>
		{:else if channel === choice.chosen}
			<span class="text-[13.5px] text-[var(--text-muted)]">{t('settings-updates-channel-in-use')}</span>
		{:else}
			<button type="button" class="button" disabled={busy || unavailable(channel)} onclick={() => (confirming = channel)}>{t('settings-updates-switch')}</button>
		{/if}
	</Row>
{/each}

{#if confirming}
	{@const channel = confirming}
	<ConfirmDialog
		title={t(CONFIRM[channel].title)}
		description={t(CONFIRM[channel].body)}
		action={t(CONFIRM[channel].action)}
		run={async () => attempt(() => commands.updatesSwitchChannel({ channel }))}
		onclose={() => (confirming = null)}
	/>
{/if}
