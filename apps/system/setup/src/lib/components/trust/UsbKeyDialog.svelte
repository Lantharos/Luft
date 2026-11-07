<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Usb from '@lucide/svelte/icons/usb';
	import { t } from '@luft/i18n';
	import { bytes, Dialog, errorText, Row, Spinner } from '@luft/ui';
	import { commands, events, type KeyDrive } from '#lib/bindings.js';
	import { WAIT_FOR_PERSON } from '#lib/bridge/system.js';

	interface Props {
		key: string;
		saved: string | null;
		onsaved: (drive: string) => void;
		onclose: () => void;
	}

	let { key, saved, onsaved, onclose }: Props = $props();

	let drives = $state<KeyDrive[]>([]);
	let saving = $state<string | null>(null);
	let error = $state('');

	$effect(() => {
		void commands.trustKeyDrives().then((found) => (drives = found)).catch(() => {});
		return events.trustKeyDrivesChanged((found) => (drives = found));
	});

	async function save(drive: KeyDrive) {
		saving = drive.block;
		error = '';
		try {
			onsaved(await commands.trustSaveKeyToDrive({ key, block: drive.block }, WAIT_FOR_PERSON));
		} catch (reason) {
			error = errorText(reason);
		} finally {
			saving = null;
		}
	}
</script>

<Dialog title={t('setup-protect-save-usb')} description={saved ? t('setup-protect-usb-saved', { drive: saved }) : t('setup-protect-usb-plug')} {onclose}>
	{#if drives.length}
		<div class="row-group">
			{#each drives as drive (drive.block)}
				<Row title={drive.name} description={bytes(drive.size)} icon={Usb}>
					{#if saved === drive.name}
						<span class="flex items-center gap-1.5 text-[13px] text-[var(--text-soft)]"><Check size={15} />{t('setup-protect-usb-done')}</span>
					{:else}
						<button type="button" class="button" disabled={saving !== null} onclick={() => save(drive)}>
							{#if saving === drive.block}<Spinner />{/if}{t('setup-protect-usb-save')}
						</button>
					{/if}
				</Row>
			{/each}
		</div>
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button {saved ? 'primary' : ''}" onclick={onclose}>{t(saved ? 'setup-protect-usb-close-saved' : 'setup-cancel')}</button>
	{/snippet}
</Dialog>
