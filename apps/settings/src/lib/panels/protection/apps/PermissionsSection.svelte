<script lang="ts">
	import Camera from '@lucide/svelte/icons/camera';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import PackageOpen from '@lucide/svelte/icons/package-open';
	import type { Component } from 'svelte';
	import { onMount } from 'svelte';
	import { t } from '@luft/i18n';
	import { Section, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import PermissionApp from './PermissionApp.svelte';
	import PermissionRow from './PermissionRow.svelte';
	import { Permissions, type Grant, type Switchable } from './permissions.svelte';

	const location = useSettings<{ enabled: boolean }>('org.gnome.system.location', ['enabled']);
	const privacy = useSettings<{ 'disable-camera': boolean }>('org.gnome.desktop.privacy', ['disable-camera']);
	const permissions = new Permissions();

	const allowed = (apps: Grant[]) => t('settings-apps-permissions-allowed', { allowed: apps.filter((app) => app.allowed).length, total: apps.length });

	onMount(() => permissions.start());
</script>

{#snippet switches(kind: Switchable, title: string, icon: Component, hint: string | undefined, disabled: boolean)}
	{@const apps = permissions.apps[kind]}
	{#if apps.length}
		<PermissionRow {title} {icon} description={allowed(apps)} {hint} {disabled}>
			{#each apps as app (app.id)}
				<PermissionApp {app}>
					<Switch label={app.name} checked={app.allowed} {disabled} onchange={(on) => permissions.toggle(kind, app, on)} />
				</PermissionApp>
			{/each}
		</PermissionRow>
	{/if}
{/snippet}

{#if permissions.any}
	<Section title={t('settings-apps-permissions')}>
		{@render switches('location', t('settings-apps-location'), MapPin, undefined, !(location.values.enabled ?? false))}
		{@render switches('camera', t('settings-apps-camera'), Camera, undefined, privacy.values['disable-camera'] ?? false)}
		{@render switches('clipboard', t('settings-apps-clipboard'), ClipboardList, t('settings-apps-clipboard-hint'), false)}
		{#if permissions.apps.fullAccess.length}
			<PermissionRow
				title={t('settings-apps-full-access')}
				icon={PackageOpen}
				description={t('settings-apps-permissions-count', { count: permissions.apps.fullAccess.length })}
				hint={t('settings-apps-full-access-hint')}
			>
				{#each permissions.apps.fullAccess as app (app.id)}
					<PermissionApp {app}>
						<button
							type="button"
							class="button"
							aria-label={t('settings-apps-full-access-remove-app', { app: app.name })}
							disabled={permissions.busy}
							onclick={() => permissions.revokeFullAccess(app)}
						>
							{t('settings-apps-full-access-remove')}
						</button>
					</PermissionApp>
				{/each}
			</PermissionRow>
		{/if}
		{#if permissions.apps.passwords.length}
			<PermissionRow
				title={t('settings-apps-passwords')}
				icon={KeyRound}
				description={t('settings-apps-permissions-count', { count: permissions.apps.passwords.length })}
				hint={t('settings-apps-passwords-hint')}
			>
				{#each permissions.apps.passwords as app (app.id)}
					<PermissionApp {app} description={t('settings-apps-permissions-allowed', { allowed: app.allowed, total: app.total })}>
						<button
							type="button"
							class="button"
							aria-label={t('settings-apps-passwords-forget-app', { app: app.name })}
							disabled={permissions.busy}
							onclick={() => permissions.forgetPasswords(app)}
						>
							{t('settings-apps-passwords-forget')}
						</button>
					</PermissionApp>
				{/each}
			</PermissionRow>
		{/if}
	</Section>

	{#if permissions.error}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{permissions.error}</p>
	{/if}
{/if}
