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

	const OTHER: Record<Channel, Channel> = { stable: 'nightly', nightly: 'stable' };
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
	const STAY = {
		stable: { title: 'settings-updates-stay-stable-title', body: 'settings-updates-stay-stable-body', action: 'settings-updates-stay-stable' },
		nightly: { title: 'settings-updates-stay-nightly-title', body: 'settings-updates-stay-nightly-body', action: 'settings-updates-stay-nightly' }
	};

	let stable = $state<StableRelease | null>(null);
	let confirming = $state(false);

	const current = $derived(choice.waiting ? OTHER[choice.chosen] : choice.chosen);
	const target = $derived(OTHER[choice.chosen]);
	const confirmation = $derived(choice.waiting ? STAY[target] : CONFIRM[target]);
	const moving = $derived(activity.running === 'channel');
	const unavailable = $derived(target === 'stable' && (stable === null || stable === 'unknown'));

	const description = $derived.by(() => {
		if (choice.waiting) return t(WAITING[choice.chosen]);
		if (current === 'nightly' && stable === 'unknown') return t('settings-updates-channel-stable-unknown');
		if (current === 'nightly' && stable === 'notYet') return t('settings-updates-channel-stable-none');
		return t(DESCRIPTIONS[current]);
	});

	void commands.updatesStableRelease().then((answer) => (stable = answer));
</script>

{#snippet progress()}
	<Progress {activity} />
{/snippet}

<Row title={t(TITLES[current])} {description} below={moving ? progress : undefined}>
	{#if moving}
		<button type="button" class="button" onclick={() => attempt(commands.updatesCancel)}>{t('settings-updates-stop')}</button>
	{:else}
		<button type="button" class="button" disabled={activity.running !== null || unavailable} onclick={() => (confirming = true)}>{t('settings-updates-switch')}</button>
	{/if}
</Row>

{#if confirming}
	{@const channel = target}
	<ConfirmDialog
		title={t(confirmation.title)}
		description={t(confirmation.body)}
		action={t(confirmation.action)}
		run={async () => attempt(() => commands.updatesSwitchChannel({ channel }))}
		onclose={() => (confirming = false)}
	/>
{/if}
