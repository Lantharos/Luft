<script lang="ts">
	import { Row, Section, Select, Switch, TextField } from '@luft/ui';
	import type { Metered, Profile } from './profile';
	import type { Errors } from './validate';

	interface Props {
		profile: Profile;
		errors: Errors;
	}

	const METERED: { value: Metered; label: string }[] = [
		{ value: 'automatic', label: 'Detect automatically' },
		{ value: 'yes', label: 'Metered' },
		{ value: 'no', label: 'Not metered' }
	];

	const AUTOCONNECT: Record<Profile['kind'], string> = {
		wifi: 'Join this network whenever it’s in range',
		wired: 'Connect as soon as a cable is plugged in',
		vpn: 'Connect whenever this computer is online',
		other: 'Connect whenever it’s available'
	};

	let { profile = $bindable(), errors }: Props = $props();

	let physical = $derived(profile.kind === 'wired' || profile.kind === 'wifi');
</script>

<Section title="General">
	<Row title="Name">
		<div class="w-[260px]">
			<TextField label="Name" bind:value={profile.name} error={errors.name} />
		</div>
	</Row>
	{#if physical}
		<Row title="Connect automatically" description={AUTOCONNECT[profile.kind]}>
			<Switch label="Connect automatically" checked={profile.autoconnect} onchange={(on) => (profile.autoconnect = on)} />
		</Row>
	{/if}
	<Row title="Available to everyone" description="Anyone who signs in here can use it">
		<Switch label="Available to everyone" checked={profile.allUsers} onchange={(on) => (profile.allUsers = on)} />
	</Row>
	{#if physical}
		<Row title="Metered connection" description="Apps and updates hold back on large downloads">
			<Select label="Metered connection" options={METERED} value={profile.metered} onchange={(metered) => (profile.metered = metered)} />
		</Row>
	{/if}
</Section>
