<script lang="ts">
	import { onDestroy } from 'svelte';
	import MonitorUp from '@lucide/svelte/icons/monitor-up';
	import { t } from '@luft/i18n';
	import { ago, AppIcon, ConfirmDialog, ItemRow, Section } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { Shared, SharedKind } from '#lib/bindings.js';
	import SubPage from '#lib/components/SubPage.svelte';

	let { onclose }: { onclose: () => void } = $props();

	const CAN: Record<SharedKind, string> = {
		screen: 'settings-sharing-can-screen',
		control: 'settings-sharing-can-control',
		input: 'settings-sharing-can-input',
		'windows-see': 'settings-sharing-can-windows-see',
		'windows-use': 'settings-sharing-can-windows-use'
	};

	let shared = $state.raw<Shared[] | null>(null);
	let revoking = $state.raw<Shared | null>(null);

	const stop = events.sharingChanged((next) => (shared = next));
	onDestroy(stop);

	function name(entry: Shared) {
		return entry.app?.name ?? t(entry.developerTools ? 'settings-sharing-developer-tools' : 'settings-sharing-unknown-app');
	}

	function details(entry: Shared) {
		const when = entry.active ? t('settings-sharing-active') : t('settings-sharing-allowed-since', { when: ago(entry.since) });
		return `${t(CAN[entry.kind])} · ${when}`;
	}

	void commands.sharingList().then((next) => (shared = next));
</script>

<SubPage title={t('settings-sharing')} {onclose}>
	{#if shared?.length}
		<Section title={t('settings-sharing-apps')}>
			{#each shared as entry (entry.id)}
				<ItemRow title={name(entry)} description={details(entry)}>
					{#snippet leading()}
						{#if entry.app}
							<AppIcon icon={entry.app.icon} id={entry.app.id} size={28} />
						{:else}
							<MonitorUp size={22} />
						{/if}
					{/snippet}
					<button type="button" class="button" onclick={() => (revoking = entry)}>{t('settings-sharing-revoke')}</button>
				</ItemRow>
			{/each}
		</Section>
	{:else if shared}
		<p class="px-1.5 text-[14px] leading-relaxed text-[var(--text-muted)]">{t('settings-sharing-empty')}</p>
	{/if}
</SubPage>

{#if revoking}
	{@const entry = revoking}
	<ConfirmDialog
		title={t('settings-sharing-revoke-title', { app: name(entry) })}
		description={t(entry.active ? 'settings-sharing-revoke-active' : 'settings-sharing-revoke-description')}
		action={t('settings-sharing-revoke')}
		danger
		run={async () => void (await commands.sharingRevoke({ id: entry.id }))}
		onclose={() => (revoking = null)}
	/>
{/if}
