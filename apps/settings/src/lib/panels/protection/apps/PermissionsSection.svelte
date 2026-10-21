<script lang="ts">
	import Camera from '@lucide/svelte/icons/camera';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import { onMount } from 'svelte';
	import { t } from '@luft/i18n';
	import { Section } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import PermissionRow from './PermissionRow.svelte';
	import { Permissions } from './permissions.svelte';

	const location = useSettings<{ enabled: boolean }>('org.gnome.system.location', ['enabled']);
	const privacy = useSettings<{ 'disable-camera': boolean }>('org.gnome.desktop.privacy', ['disable-camera']);
	const permissions = new Permissions();

	let asked = $derived(permissions.apps.location.length || permissions.apps.camera.length);

	onMount(() => permissions.start());
</script>

{#if asked}
	<Section title={t('settings-privacy-apps-asked')}>
		{#if permissions.apps.location.length}
			<PermissionRow
				title={t('settings-privacy-location')}
				icon={MapPin}
				apps={permissions.apps.location}
				disabled={!(location.values.enabled ?? false)}
				ontoggle={(app, allowed) => permissions.toggle('location', app, allowed)}
			/>
		{/if}
		{#if permissions.apps.camera.length}
			<PermissionRow
				title={t('settings-privacy-camera')}
				icon={Camera}
				apps={permissions.apps.camera}
				disabled={privacy.values['disable-camera'] ?? false}
				ontoggle={(app, allowed) => permissions.toggle('camera', app, allowed)}
			/>
		{/if}
	</Section>
{/if}
