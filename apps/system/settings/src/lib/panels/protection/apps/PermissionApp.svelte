<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import { AppIcon, ItemRow, Row, Switch } from '@luft/ui';
	import type { AppAccess, SandboxDevice, Switchable } from '#lib/bindings.js';
	import type { Permissions } from './permissions.svelte';

	let { app, permissions }: { app: AppAccess; permissions: Permissions } = $props();

	let expanded = $state(false);

	const SWITCHES: { kind: Switchable; label: string }[] = [
		{ kind: 'location', label: 'settings-apps-location' },
		{ kind: 'camera', label: 'settings-apps-camera' },
		{ kind: 'clipboard', label: 'settings-apps-clipboard' }
	];
	const DEVICES: { device: SandboxDevice; label: string; hint: string }[] = [
		{ device: 'usb', label: 'settings-apps-usb', hint: 'settings-apps-usb-hint' },
		{ device: 'serial', label: 'settings-apps-serial', hint: 'settings-apps-serial-hint' }
	];

	const folders = $derived([
		...app.folders.map((folder) => ({ folder, readOnly: false })),
		...app.readOnlyFolders.map((folder) => ({ folder, readOnly: true }))
	]);
	const granted = $derived([
		...SWITCHES.filter(({ kind }) => app[kind]).map(({ label }) => t(label)),
		...(app.passwords?.allowed ? [t('settings-apps-passwords')] : []),
		...(folders.length ? [t('settings-apps-folders-count', { count: folders.length })] : []),
		...DEVICES.filter(({ device }) => app.devices.includes(device)).map(({ label }) => t(label)),
		...(app.services.length ? [t('settings-apps-services-count', { count: app.services.length })] : []),
		...(app.fullAccess ? [t('settings-apps-full-access')] : [])
	]);
	const summary = $derived(
		granted.length ? new Intl.ListFormat(i18n.formats, { type: 'conjunction' }).format(granted) : t('settings-apps-sandbox-only')
	);
</script>

<ItemRow title={app.name} description={summary} onclick={() => (expanded = !expanded)}>
	{#snippet leading()}
		<AppIcon icon={app.icon} id={app.id} size={28} />
	{/snippet}
</ItemRow>

{#if expanded}
	<div class="pl-[42px]">
		{#each SWITCHES as { kind, label } (kind)}
			{#if app[kind] !== null}
				<Row title={t(label)}>
					<Switch label={t(label)} checked={app[kind] ?? false} disabled={permissions.busy} onchange={(on) => permissions.toggle(kind, app, on)} />
				</Row>
			{/if}
		{/each}
		{#if app.passwords}
			<Row title={t('settings-apps-passwords')} description={t('settings-apps-permissions-allowed', app.passwords)}>
				<button
					type="button"
					class="button"
					aria-label={t('settings-apps-passwords-forget-app', { app: app.name })}
					disabled={permissions.busy}
					onclick={() => permissions.forgetPasswords(app)}
				>
					{t('settings-apps-passwords-forget')}
				</button>
			</Row>
		{/if}
		{#if app.appImage && !app.fullAccess}
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
			<Row title={t('settings-apps-downloads')} description={t('settings-apps-downloads-hint')}>
				<Switch label={t('settings-apps-downloads')} checked={app.downloads} disabled={permissions.busy} onchange={(on) => permissions.setSwitch(app, 'downloads', on)} />
			</Row>
			<Row title={t('settings-apps-internet')} description={t('settings-apps-internet-hint')}>
				<Switch label={t('settings-apps-internet')} checked={app.online} disabled={permissions.busy} onchange={(on) => permissions.setSwitch(app, 'internet', on)} />
			</Row>
			{#each app.services as service (service)}
				<Row title={service} description={t('settings-apps-service-hint')} truncate>
					<button
						type="button"
						class="button"
						aria-label={t('settings-apps-service-remove-app', { service })}
						disabled={permissions.busy}
						onclick={() => permissions.removeService(app, service)}
					>
						{t('settings-apps-service-remove')}
					</button>
				</Row>
			{/each}
			{#each DEVICES as { device, label, hint } (device)}
				<Row title={t(label)} description={t(hint)}>
					<Switch
						label={t(label)}
						checked={app.devices.includes(device)}
						disabled={permissions.busy}
						onchange={(on) => permissions.setDevice(app, device, on)}
					/>
				</Row>
			{/each}
		{/if}
		{#if app.fullAccess}
			<Row title={t('settings-apps-full-access')} description={t('settings-apps-full-access-hint')}>
				<button
					type="button"
					class="button"
					aria-label={t('settings-apps-full-access-remove-app', { app: app.name })}
					disabled={permissions.busy}
					onclick={() => permissions.revokeFullAccess(app)}
				>
					{t('settings-apps-full-access-remove')}
				</button>
			</Row>
		{:else}
			<Row title={t('settings-apps-full-access')} description={t('settings-apps-full-access-off')}>
				<button type="button" class="button" disabled={permissions.busy} onclick={() => permissions.askForFullAccess(app)}>
					{t('settings-apps-full-access-give')}
				</button>
			</Row>
		{/if}
	</div>
{/if}
