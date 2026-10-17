<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import Wifi from '@lucide/svelte/icons/wifi';
	import WifiHigh from '@lucide/svelte/icons/wifi-high';
	import WifiLow from '@lucide/svelte/icons/wifi-low';
	import { PasswordField } from '@luft/ui';
	import { needsPassword, type WifiNetwork } from '#lib/api/network.js';

	interface Props {
		network: WifiNetwork;
		open: boolean;
		problem: string;
		onchoose: () => void;
		onjoin: (password: string) => void;
	}

	let { network, open, problem, onchoose, onjoin }: Props = $props();
	let password = $state('');

	let Signal = $derived(network.strength > 66 ? Wifi : network.strength > 33 ? WifiHigh : WifiLow);
	let status = $derived(
		problem || { connected: 'Connected', connecting: 'Connecting…', disconnected: network.joined ? 'Saved' : '', unplugged: '' }[network.state]
	);
</script>

<div class="row" class:open>
	<button type="button" class="flex w-full items-center gap-3.5 px-4 py-3 text-left" onclick={onchoose}>
		<Signal size={20} class="flex-none text-[var(--text-soft)]" />
		<span class="min-w-0 flex-1 truncate text-[15px]">{network.ssid}</span>
		{#if status}
			<span class="text-[13px] {problem ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}">{status}</span>
		{/if}
		{#if needsPassword(network.security) || network.security === 'enterprise'}
			<Lock size={15} class="flex-none text-[var(--text-muted)]" />
		{/if}
	</button>
	{#if open}
		<form class="flex items-start gap-2 px-4 pb-4" onsubmit={(event) => (event.preventDefault(), onjoin(password))}>
			<div class="flex-1"><PasswordField bind:value={password} label="Password" placeholder="Password" /></div>
			<button type="submit" class="button primary large" disabled={!password}>Join</button>
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
