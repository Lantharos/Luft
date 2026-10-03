<script lang="ts">
	import { tick } from 'svelte';
	import { Checkbox, Dialog, TextField } from '@luft/ui';
	import * as api from '$lib/api';
	import Icon from '$lib/components/Icon.svelte';
	import { normalizeAddress, protocolName } from '$lib/file-manager/location/addresses';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import type { NetworkPlace } from '$lib/types';

	interface Props {
		manager: FileManager;
		onclose: () => void;
	}

	let { manager, onclose }: Props = $props();

	let field = $state<{ focus: () => void }>();
	let address = $state('');
	let keep = $state(false);
	let nearby = $state.raw<NetworkPlace[] | null>(null);

	let uri = $derived(normalizeAddress(address));
	let protocol = $derived(uri ? protocolName(uri) : null);
	let recent = $derived(settings.value.recentServers);

	$effect(() => {
		void tick().then(() => field?.focus());
		void api.discoverNetwork().then((places) => (nearby = places), () => (nearby = []));
	});

	function connect(target = address) {
		if (!normalizeAddress(target)) return;
		onclose();
		void manager.openAddress(target, manager.navigate, keep);
	}
</script>

{#snippet server(place: NetworkPlace, removable: boolean)}
	<div class="server">
		<button type="button" class="server__main" onclick={() => connect(place.uri)}>
			<Icon name="server" size={17} />
			<span class="flex min-w-0 flex-col">
				<span class="truncate">{place.name}</span>
				{#if place.name !== place.uri}
					<span class="truncate text-[12px] text-[var(--text-muted)]">{place.uri}</span>
				{/if}
			</span>
		</button>
		{#if removable}
			<button type="button" class="icon-button" aria-label={`Forget ${place.uri}`} onclick={() => manager.network.forgetRecent(place.uri)}>
				<Icon name="x" size={15} />
			</button>
		{/if}
	</div>
{/snippet}

<Dialog title="Connect to server" {onclose}>
	<TextField
		bind:this={field}
		label="Server address"
		placeholder="sftp://example.com or smb://server/share"
		bind:value={address}
		onkeydown={(event) => event.key === 'Enter' && connect()}
	/>
	<p class="-mt-1 px-1 text-[12.5px] text-[var(--text-muted)]">
		{protocol ? `Connects with ${protocol}` : 'SFTP, Windows shares (SMB), FTP, WebDAV and NFS addresses work here.'}
	</p>
	<Checkbox label="Keep in sidebar" checked={keep} onchange={(value) => (keep = value)}>Keep in sidebar</Checkbox>

	{#if recent.length > 0}
		<div class="flex flex-col gap-1.5">
			<span class="px-1 text-[13px] font-medium text-[var(--text-soft)]">Recent</span>
			<div class="row-group">
				{#each recent as uri (uri)}
					{@render server({ name: manager.network.nameFor(uri), uri }, true)}
				{/each}
			</div>
		</div>
	{/if}

	{#if nearby === null || nearby.length > 0}
		<div class="flex flex-col gap-1.5">
			<span class="px-1 text-[13px] font-medium text-[var(--text-soft)]">On this network</span>
			{#if nearby === null}
				<p class="px-1 text-[12.5px] text-[var(--text-muted)]">Looking for servers…</p>
			{:else}
				<div class="row-group">
					{#each nearby as place (place.uri)}
						{@render server(place, false)}
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	{#snippet actions()}
		<button class="button" type="button" onclick={onclose}>Cancel</button>
		<button class="button primary" type="button" disabled={!uri} onclick={() => connect()}>Connect</button>
	{/snippet}
</Dialog>

<style>
	.server {
		display: flex;
		align-items: center;
		padding-right: 8px;
		transition: background-color 160ms var(--ease);
	}

	.server:has(.server__main:hover) {
		background: var(--surface-hover);
	}

	.server__main {
		display: flex;
		min-width: 0;
		min-height: 48px;
		flex: 1;
		align-items: center;
		gap: 12px;
		padding: 8px 14px;
		text-align: left;
		font-size: 13px;
		color: var(--text-soft);
	}
</style>
