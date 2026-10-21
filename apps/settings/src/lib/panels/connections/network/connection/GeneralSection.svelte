<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Select, Switch, TextField } from '@luft/ui';
	import type { Metered, Profile } from '@luft/network';
	import type { Errors } from './validate';

	interface Props {
		profile: Profile;
		errors: Errors;
	}

	const AUTOCONNECT: Record<Profile['kind'], string> = {
		wifi: 'settings-network-autoconnect-wifi',
		wired: 'settings-network-autoconnect-wired',
		vpn: 'settings-network-autoconnect-vpn',
		other: 'settings-network-autoconnect-other'
	};

	let { profile = $bindable(), errors }: Props = $props();

	let physical = $derived(profile.kind === 'wired' || profile.kind === 'wifi');
	let meteredOptions = $derived<{ value: Metered; label: string }[]>([
		{ value: 'automatic', label: t('settings-network-metered-automatic') },
		{ value: 'yes', label: t('settings-network-metered-yes') },
		{ value: 'no', label: t('settings-network-metered-no') }
	]);
</script>

<Section title={t('settings-network-general')}>
	<Row title={t('settings-network-name')}>
		<div class="w-[260px]">
			<TextField label={t('settings-network-name')} bind:value={profile.name} error={errors.name} />
		</div>
	</Row>
	{#if physical}
		<Row title={t('settings-network-autoconnect')} description={t(AUTOCONNECT[profile.kind])}>
			<Switch label={t('settings-network-autoconnect')} checked={profile.autoconnect} onchange={(on) => (profile.autoconnect = on)} />
		</Row>
	{/if}
	<Row title={t('settings-network-all-users')} description={t('settings-network-all-users.description')}>
		<Switch label={t('settings-network-all-users')} checked={profile.allUsers} onchange={(on) => (profile.allUsers = on)} />
	</Row>
	{#if physical}
		<Row title={t('settings-network-metered')} description={t('settings-network-metered.description')}>
			<Select label={t('settings-network-metered')} options={meteredOptions} value={profile.metered} onchange={(metered) => (profile.metered = metered)} />
		</Row>
	{/if}
</Section>
