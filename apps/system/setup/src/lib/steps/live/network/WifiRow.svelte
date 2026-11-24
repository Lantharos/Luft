<script lang="ts">
	import Lock from '@luft/symbols/icons/lock';
	import Wifi from '@luft/symbols/icons/wifi';
	import WifiHigh from '@luft/symbols/icons/wifi-high';
	import WifiLow from '@luft/symbols/icons/wifi-low';
	import WifiZero from '@luft/symbols/icons/wifi-zero';
	import { t } from '@luft/i18n';
	import { PasswordField, Spinner } from '@luft/ui';
	import { needsPassword, signalLevel, type SignalLevel, type WifiNetwork } from '@luft/network';

	interface Props {
		network: WifiNetwork;
		open: boolean;
		problem: string;
		onchoose: () => void;
		onjoin: (password: string) => void;
	}

	let { network, open, problem, onchoose, onjoin }: Props = $props();
	let password = $state('');

	const SIGNAL_ICONS: Record<SignalLevel, typeof Wifi> = { excellent: Wifi, good: WifiHigh, ok: WifiLow, weak: WifiZero, none: WifiZero };

	let Signal = $derived(SIGNAL_ICONS[signalLevel(network.strength)]);
	let statusId = $derived({ connected: 'setup-network-connected', connecting: 'setup-network-connecting', disconnected: network.joined ? 'setup-network-saved' : '', unplugged: '' }[network.state]);
	let status = $derived(problem || (statusId && t(statusId)));
</script>

<div class="row" class:open>
	<button type="button" class="flex w-full items-center gap-3.5 px-4 py-3 text-left" onclick={onchoose}>
		<Signal size={20} class="flex-none text-[var(--text-soft)]" />
		<span class="min-w-0 flex-1 truncate text-[15px]">{network.ssid}</span>
		{#if network.state === 'connecting' && !problem}<Spinner size={15} class="text-[var(--text-muted)]" />{/if}
		{#if status}
			<span class="text-[13px] {problem ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}">{status}</span>
		{/if}
		{#if needsPassword(network.security) || network.security === 'enterprise'}
			<Lock size={15} class="flex-none text-[var(--text-muted)]" />
		{/if}
	</button>
	{#if open}
		<form class="flex items-start gap-2 px-4 pb-4" onsubmit={(event) => (event.preventDefault(), onjoin(password))}>
			<div class="flex-1"><PasswordField bind:value={password} label={t('setup-network-password')} placeholder={t('setup-network-password')} /></div>
			<button type="submit" class="button primary large" disabled={!password}>{t('setup-network-join')}</button>
		</form>
	{/if}
</div>

<style>
	.row {
		border-radius: 16px;
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.row:hover,
	.row.open {
		background: var(--surface-hover);
	}
</style>
