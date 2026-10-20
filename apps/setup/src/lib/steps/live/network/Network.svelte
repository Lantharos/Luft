<script lang="ts">
	import Cable from '@lucide/svelte/icons/cable';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { t } from '@luft/i18n';
	import { Switch } from '@luft/ui';
	import * as network from '#lib/api/network.js';
	import type { Network, WifiNetwork } from '#lib/api/network.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { regional } from '#lib/state/regional.svelte.js';
	import WifiRow from './WifiRow.svelte';

	const SHOWN = 6;
	const FAILED = 'setup-network-failed';
	const WRONG_PASSWORD = 'setup-network-wrong-password';

	let current = $state<Network | null>(null);
	let unavailable = $state(false);
	let joining = $state<string | null>(null);
	let attempt = $state<string | null>(null);
	let problems = $state<Record<string, string>>({});
	let all = $state(false);

	let wifi = $derived(current?.wifi ?? null);
	let wired = $derived(current?.wired.find((link) => link.state === 'connected') ?? null);
	let online = $derived(Boolean(wired) || Boolean(wifi?.networks.some((entry) => entry.state === 'connected')));
	$effect(() => {
		if (online) void regional.locate();
	});

	let networks = $derived(all ? (wifi?.networks ?? []) : (wifi?.networks.slice(0, SHOWN) ?? []));

	$effect(() => {
		void network
			.open()
			.then((opened) => (current = opened))
			.catch(() => (unavailable = true));
		const stops = [
			network.onChanged((changed) => (current = changed)),
			network.onFailed((failure) => {
				if (!attempt || failure.path !== wifi?.device) return;
				problems[attempt] = failure.reason === 'password' ? WRONG_PASSWORD : FAILED;
				if (failure.reason === 'password') joining = attempt;
				attempt = null;
			})
		];
		return () => {
			stops.forEach((stop) => stop());
			void network.close();
		};
	});

	async function run(ssid: string, action: () => Promise<void>) {
		delete problems[ssid];
		attempt = ssid;
		joining = null;
		await action().catch(() => {
			problems[ssid] = FAILED;
			attempt = null;
		});
	}

	function choose(entry: WifiNetwork) {
		if (!wifi || entry.state !== 'disconnected') return;
		if (entry.saved) void run(entry.ssid, () => network.activate(entry.saved!, wifi!.device));
		else if (network.needsPassword(entry.security)) joining = joining === entry.ssid ? null : entry.ssid;
		else void run(entry.ssid, () => network.join(wifi!.device, entry.ssid, entry.security, ''));
	}
</script>

<StepFrame title={t('setup-network-title')} description={t('setup-network-description')}>
	{#if unavailable}
		<p class="text-[14px] text-[var(--text-soft)]">{t('setup-network-unavailable')}</p>
	{:else if !current}
		<div class="flex items-center gap-3 text-[14px] text-[var(--text-soft)]"><LoaderCircle size={18} class="animate-spin" />{t('setup-network-looking')}</div>
	{:else}
		<div class="flex flex-col gap-1">
			{#if wired}
				<div class="flex items-center gap-3.5 px-4 py-3">
					<Cable size={20} class="text-[var(--text-soft)]" />
					<span class="flex-1 text-[15px]">{t('setup-network-cable')}</span>
				</div>
			{/if}
			{#if wifi}
				<div class="flex items-center justify-between px-4 py-2">
					<span class="text-[14px] font-medium text-[var(--text-soft)]">Wi-Fi</span>
					<Switch checked={wifi.enabled} label="Wi-Fi" disabled={!wifi.hardwareEnabled} onchange={(enabled) => network.setWifi(enabled)} />
				</div>
				{#if wifi.enabled}
					{#each networks as entry (entry.ssid)}
						<WifiRow
							network={entry}
							open={joining === entry.ssid}
							problem={problems[entry.ssid] ? t(problems[entry.ssid]) : ''}
							onchoose={() => choose(entry)}
							onjoin={(password) => run(entry.ssid, () => network.join(wifi!.device, entry.ssid, entry.security, password))}
						/>
					{/each}
					{#if !all && wifi.networks.length > SHOWN}
						<button type="button" class="plain-button self-start" onclick={() => (all = true)}>{t('setup-network-show-all')}</button>
					{/if}
				{/if}
			{/if}
		</div>
	{/if}
	{#snippet actions()}
		<button type="button" class="button {online ? 'primary' : ''} large px-6" onclick={() => flow.next()}>{t(online ? 'setup-continue' : 'setup-network-skip')}</button>
	{/snippet}
</StepFrame>
