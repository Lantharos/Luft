<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { onMount } from 'svelte';
	import { IconButton, Row, Section } from '@luft/ui';
	import { forget, remove, type Network } from '../api';
	import AdvancedSection from './AdvancedSection.svelte';
	import DetailsSection from './DetailsSection.svelte';
	import GeneralSection from './GeneralSection.svelte';
	import IpSection from './IpSection.svelte';
	import SecuritySection from './SecuritySection.svelte';
	import { loadProfile, loadSecret, macChoice, prepare, saveProfile, type Profile, type Target } from './profile';
	import { checkProfile } from './validate';

	interface Props {
		target: Target;
		title: string;
		network: Network;
		onclose: () => void;
	}

	let { target, title, network, onclose }: Props = $props();

	let root = $state<HTMLDivElement>();
	let profile = $state<Profile | null>(null);
	let original = $state('');
	let password = $state('');
	let savedPassword = $state('');
	let customMac = $state(false);
	let saving = $state(false);
	let problem = $state('');

	let originalSecurity = $derived(original ? (JSON.parse(original) as Profile).wireless?.security : undefined);
	let passwordNeeded = $derived(Boolean(profile?.wireless && profile.wireless.security !== originalSecurity));
	let errors = $derived(profile ? checkProfile(profile, { password, passwordNeeded, customMac }) : {});
	let changed = $derived(Boolean(profile) && (JSON.stringify(profile) !== original || password !== savedPassword));
	let ready = $derived(changed && !saving && Object.keys(errors).length === 0);

	function explain(reason: unknown) {
		return reason instanceof Error ? reason.message : String(reason);
	}

	async function reveal() {
		if (savedPassword || passwordNeeded) return;
		try {
			savedPassword = (await loadSecret(target.path)) ?? '';
			if (!password) password = savedPassword;
		} catch (reason) {
			problem = explain(reason);
		}
	}

	async function save() {
		if (!profile || !ready) return;
		saving = true;
		problem = '';
		try {
			await saveProfile(target.path, prepare($state.snapshot(profile)), password === savedPassword ? null : password);
			onclose();
		} catch (reason) {
			problem = explain(reason);
			saving = false;
		}
	}

	async function forgetNetwork(ssid: string) {
		await forget(ssid);
		onclose();
	}

	async function removeConnection() {
		problem = '';
		try {
			await remove(target.path);
			onclose();
		} catch (reason) {
			problem = explain(reason);
		}
	}

	onMount(() => {
		root?.scrollIntoView({ block: 'start' });
		loadProfile(target.path)
			.then((loaded) => {
				original = JSON.stringify(loaded);
				customMac = macChoice(loaded.kind, loaded.mac) === 'custom';
				profile = loaded;
			})
			.catch((reason) => (problem = explain(reason)));
	});
</script>

<div bind:this={root} class="flex scroll-mt-4 flex-col gap-7">
	<div class="-mb-2 flex items-center gap-3">
		<IconButton icon={ArrowLeft} label="Back to Network" onclick={onclose} />
		<h2 class="min-w-0 flex-1 truncate text-[17px] font-semibold">{title}</h2>
		<button type="button" class="button primary" disabled={!ready} onclick={save}>{saving ? 'Saving…' : 'Save'}</button>
	</div>

	{#if problem}
		<p class="-my-3 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}

	<DetailsSection {target} {network} />

	{#if profile}
		<GeneralSection bind:profile {errors} />
		{#if profile.wireless}
			<SecuritySection bind:wireless={profile.wireless} bind:password {errors} saved={!passwordNeeded} onreveal={reveal} />
		{/if}
		<IpSection family="ipv4" bind:ip={profile.ipv4} {errors} />
		<IpSection family="ipv6" bind:ip={profile.ipv6} {errors} />
		{#if profile.kind === 'wired' || profile.kind === 'wifi'}
			<AdvancedSection bind:profile bind:custom={customMac} {errors} />
		{/if}
		{#if target.kind === 'wifi'}
			{@const ssid = target.ssid}
			<Section>
				<Row title="Forget this network" description="Removes its password and settings from this computer">
					<button type="button" class="button danger" onclick={() => forgetNetwork(ssid)}>Forget</button>
				</Row>
			</Section>
		{:else}
			<Section>
				<Row
					title={target.kind === 'vpn' ? 'Remove this VPN' : 'Remove this connection'}
					description="Deletes its settings from this computer"
				>
					<button type="button" class="button danger" onclick={removeConnection}>Remove</button>
				</Row>
			</Section>
		{/if}
	{/if}
</div>
