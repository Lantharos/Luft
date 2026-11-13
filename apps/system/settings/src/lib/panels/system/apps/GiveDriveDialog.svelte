<script lang="ts">
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import { t } from '@luft/i18n';
	import { bytes, Dialog, Row, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { AppAccess, PluggedDrive } from '#lib/bindings.js';

	interface Props {
		app: AppAccess;
		ongive: (drive: PluggedDrive, readOnly: boolean) => void;
		onclose: () => void;
	}

	let { app, ongive, onclose }: Props = $props();

	let drives = $state<PluggedDrive[] | null>(null);
	let readOnly = $state(false);

	$effect(() => {
		void commands.appsDrivesPlugged({ app: app.id }).then((plugged) => (drives = plugged));
	});
</script>

<Dialog title={t('settings-apps-drive-give-title', { app: app.name })} {onclose}>
	<Row title={t('settings-apps-drive-read-only')}>
		<Switch label={t('settings-apps-drive-read-only')} checked={readOnly} onchange={(on) => (readOnly = on)} />
	</Row>
	<div class="list soft-scroll">
		{#each drives ?? [] as drive (`${drive.uuid} ${drive.drive}`)}
			<button type="button" class="drive" onclick={() => ongive(drive, readOnly)}>
				<HardDrive size={20} class="flex-none text-[var(--text-muted)]" />
				<span class="truncate">{drive.label || t('settings-apps-drive-unnamed', { size: bytes(drive.size) })}</span>
				<span class="ml-auto flex-none text-[12.5px] text-[var(--text-muted)]">{bytes(drive.size)}</span>
			</button>
		{:else}
			{#if drives}
				<p class="empty">{t('settings-apps-drive-none')}</p>
			{/if}
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('settings-apps-cancel')}</button>
	{/snippet}
</Dialog>

<style>
	.list {
		display: flex;
		max-height: 280px;
		flex-direction: column;
		gap: 2px;
		overflow-y: auto;
		margin-inline: -6px;
		margin-top: 8px;
	}

	.drive {
		display: flex;
		min-height: 44px;
		flex: none;
		align-items: center;
		gap: 12px;
		border-radius: 12px;
		padding-inline: 10px;
		text-align: left;
		font-size: 13.5px;
		color: var(--text-soft);
		transition: background-color var(--motion-tap) var(--ease-decelerate), color var(--motion-tap) var(--ease-decelerate);
	}

	.drive:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.empty {
		padding: 24px 8px;
		text-align: center;
		font-size: 13px;
		color: var(--text-muted);
	}
</style>
