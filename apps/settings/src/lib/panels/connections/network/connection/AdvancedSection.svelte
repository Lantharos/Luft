<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Row, Section, Select, TextField } from '@luft/ui';
	import type { MacChoice, Profile } from '@luft/network';
	import { macChoice } from './profile';
	import type { Errors } from './validate';

	interface Props {
		profile: Profile;
		custom: boolean;
		errors: Errors;
	}

	let { profile = $bindable(), custom = $bindable(), errors }: Props = $props();

	let wifiChoices = $derived<{ value: MacChoice; label: string }[]>([
		{ value: 'random', label: t('settings-network-mac-random') },
		{ value: 'stable', label: t('settings-network-mac-stable') },
		{ value: 'builtin', label: t('settings-network-mac-private-off') }
	]);
	let wiredChoices = $derived<{ value: MacChoice; label: string }[]>([
		{ value: 'builtin', label: t('settings-network-mac-builtin') },
		{ value: 'random', label: t('settings-network-mac-random') },
		{ value: 'stable', label: t('settings-network-mac-stable') },
		{ value: 'custom', label: t('settings-network-mac-custom') }
	]);

	const original = untrack(() => profile.mac);

	let wifi = $derived(profile.kind === 'wifi');
	let mtu = $state(untrack(() => (profile.mtu ? String(profile.mtu) : '')));
	let choice = $derived<MacChoice>(custom ? 'custom' : macChoice(profile.kind, profile.mac));

	function choose(next: MacChoice) {
		custom = next === 'custom';
		if (macChoice(profile.kind, original) === next) profile.mac = original;
		else if (next === 'builtin') profile.mac = 'permanent';
		else profile.mac = custom ? '' : next;
	}

	function setMtu(text: string) {
		mtu = text;
		profile.mtu = text.trim() ? Number(text) : 0;
	}
</script>

<Section title={t('settings-network-advanced')}>
	{#if wifi}
		<Row title={t('settings-network-private-address')} description={t('settings-network-private-address.description')}>
			<Select label={t('settings-network-private-address')} options={wifiChoices} value={choice} onchange={choose} />
		</Row>
	{:else}
		<Row title={t('settings-network-hardware-address')} description={t('settings-network-hardware-address.description')}>
			<Select label={t('settings-network-hardware-address')} options={wiredChoices} value={choice} onchange={choose} />
		</Row>
		{#if choice === 'custom'}
			<Row title={t('settings-network-mac-custom')}>
				<div class="w-[260px]">
					<TextField label={t('settings-network-mac-custom')} bind:value={profile.mac} placeholder="12:34:56:78:9A:BC" error={errors.mac} live />
				</div>
			</Row>
		{/if}
	{/if}
	<Row title={t('settings-network-mtu')} description={t('settings-network-mtu.description')}>
		<div class="w-[120px]">
			<TextField label={t('settings-network-mtu.label')} bind:value={() => mtu, setMtu} placeholder={t('settings-network-automatic')} inputmode="numeric" error={errors.mtu} />
		</div>
	</Row>
</Section>
