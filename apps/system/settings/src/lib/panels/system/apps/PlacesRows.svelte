<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Row } from '@luft/ui';
	import type { AppAccess, GivenDrive } from '#lib/bindings.js';
	import GiveDriveDialog from './GiveDriveDialog.svelte';
	import type { Permissions } from './permissions.svelte';

	let { app, permissions }: { app: AppAccess; permissions: Permissions } = $props();

	let giving = $state(false);

	const folders = $derived([
		...app.folders.map((folder) => ({ folder, readOnly: false })),
		...app.readOnlyFolders.map((folder) => ({ folder, readOnly: true }))
	]);

	const driveName = (drive: GivenDrive) => drive.label || t('settings-apps-drive-unnamed', { size: bytes(drive.size) });
	const driveState = (drive: GivenDrive) =>
		!drive.pluggedIn ? t('settings-apps-drive-unplugged') : drive.readOnly ? t('settings-apps-folder-read-only') : undefined;
</script>

<Row title={t('settings-apps-drives')} description={t('settings-apps-drives-hint')}>
	<button type="button" class="button" disabled={permissions.busy} onclick={() => (giving = true)}>
		{t('settings-apps-drive-give')}
	</button>
</Row>
{#each app.drives as drive (`${drive.uuid} ${drive.drive}`)}
	<Row title={driveName(drive)} description={driveState(drive)} truncate>
		<button
			type="button"
			class="button"
			aria-label={t('settings-apps-drive-remove-app', { drive: driveName(drive) })}
			disabled={permissions.busy}
			onclick={() => permissions.takeDrive(app, drive)}
		>
			{t('settings-apps-folder-remove')}
		</button>
	</Row>
{/each}
<Row title={t('settings-apps-folders')} description={t('settings-apps-folders-hint')}>
	<button type="button" class="button" disabled={permissions.busy} onclick={() => permissions.addFolder(app)}>
		{t('settings-apps-folder-add')}
	</button>
</Row>
{#each folders as { folder, readOnly } (folder)}
	<Row title={folder} description={readOnly ? t('settings-apps-folder-read-only') : undefined} truncate>
		<button
			type="button"
			class="button"
			aria-label={t('settings-apps-folder-remove-app', { folder })}
			disabled={permissions.busy}
			onclick={() => permissions.removeFolder(app, folder)}
		>
			{t('settings-apps-folder-remove')}
		</button>
	</Row>
{/each}

{#if giving}
	<GiveDriveDialog
		{app}
		ongive={(drive, readOnly) => {
			giving = false;
			void permissions.giveDrive(app, drive, readOnly);
		}}
		onclose={() => (giving = false)}
	/>
{/if}
