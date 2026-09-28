<script lang="ts">
	import { untrack } from 'svelte';
	import { Row, Section, Select, TextField } from '@luft/ui';
	import { macChoice, type MacChoice, type Profile } from './profile';
	import type { Errors } from './validate';

	interface Props {
		profile: Profile;
		custom: boolean;
		errors: Errors;
	}

	const WIFI_CHOICES: { value: MacChoice; label: string }[] = [
		{ value: 'random', label: 'New address each time' },
		{ value: 'stable', label: 'Same address for this network' },
		{ value: 'builtin', label: 'Off' }
	];
	const WIRED_CHOICES: { value: MacChoice; label: string }[] = [
		{ value: 'builtin', label: 'Built-in address' },
		{ value: 'random', label: 'New address each time' },
		{ value: 'stable', label: 'Same address for this network' },
		{ value: 'custom', label: 'Custom address' }
	];

	let { profile = $bindable(), custom = $bindable(), errors }: Props = $props();

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

<Section title="Advanced">
	{#if wifi}
		<Row title="Private address" description="Uses a different hardware address on this network so it’s harder to track your device">
			<Select label="Private address" options={WIFI_CHOICES} value={choice} onchange={choose} />
		</Row>
	{:else}
		<Row title="Hardware address" description="The address this computer shows to the network">
			<Select label="Hardware address" options={WIRED_CHOICES} value={choice} onchange={choose} />
		</Row>
		{#if choice === 'custom'}
			<Row title="Custom address">
				<div class="w-[260px]">
					<TextField label="Custom address" bind:value={profile.mac} placeholder="12:34:56:78:9A:BC" error={errors.mac} live />
				</div>
			</Row>
		{/if}
	{/if}
	<Row title="Largest packet size (MTU)" description="Leave empty unless your network needs a specific size">
		<div class="w-[120px]">
			<TextField label="MTU" bind:value={() => mtu, setMtu} placeholder="Automatic" inputmode="numeric" error={errors.mtu} />
		</div>
	</Row>
</Section>
