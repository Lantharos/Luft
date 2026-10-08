<script lang="ts">
	import { untrack } from 'svelte';
	import { Dialog, Segmented, TextField } from '@luft/ui';
	import { words } from './connection/validate';
	import type { Mode, Protocol, Proxy } from './proxy.svelte';

	interface Props {
		proxy: Proxy;
		onclose: () => void;
	}

	interface Draft {
		host: string;
		port: string;
	}

	const MODES: { value: Mode; label: string }[] = [
		{ value: 'none', label: 'Off' },
		{ value: 'manual', label: 'Manual' },
		{ value: 'auto', label: 'Automatic' }
	];
	const SERVERS: { protocol: Protocol; label: string }[] = [
		{ protocol: 'http', label: 'Web (HTTP)' },
		{ protocol: 'https', label: 'Secure web (HTTPS)' },
		{ protocol: 'socks', label: 'SOCKS' }
	];

	let { proxy, onclose }: Props = $props();

	const initial = untrack(() => ({
		mode: proxy.mode,
		url: proxy.main.values['autoconfig-url'] ?? '',
		skip: (proxy.main.values['ignore-hosts'] ?? []).join(', '),
		servers: Object.fromEntries(
			SERVERS.map(({ protocol }) => {
				const { host = '', port = 0 } = proxy.servers[protocol].values;
				return [protocol, { host, port: host && port ? String(port) : '' }];
			})
		) as Record<Protocol, Draft>
	}));

	let mode = $state(initial.mode);
	let url = $state(initial.url);
	let skip = $state(initial.skip);
	let servers = $state(initial.servers);
	let touched = $state(Object.fromEntries(SERVERS.map(({ protocol }) => [protocol, { host: false, port: false }])) as Record<Protocol, { host: boolean; port: boolean }>);
	let saving = $state(false);
	let problem = $state('');

	let errors = $derived(check());
	let ready = $derived(!saving && Object.keys(errors).length === 0);

	function message(protocol: Protocol) {
		return (['host', 'port'] as const).map((field) => (touched[protocol][field] ? errors[`${protocol}.${field}`] : undefined)).find(Boolean);
	}

	function check() {
		const errors: Record<string, string> = {};
		if (mode === 'auto' && !/^(https?|file):\/\/\S+$/.test(url.trim())) errors.url = 'Enter a web address, like http://example.com/proxy.pac';
		if (mode !== 'manual') return errors;
		for (const { protocol } of SERVERS) {
			const { host, port } = servers[protocol];
			if (host.includes('://') || /\s/.test(host.trim())) errors[`${protocol}.host`] = 'Enter just the server name, like proxy.example.com';
			const number = Number(port);
			if (host.trim() && !(Number.isInteger(number) && number >= 1 && number <= 65535)) errors[`${protocol}.port`] = 'Use a port from 1 to 65535';
		}
		return errors;
	}

	async function save() {
		if (!ready) return;
		saving = true;
		try {
			if (mode === 'auto') await proxy.main.set('autoconfig-url', url.trim());
			if (mode === 'manual') {
				for (const { protocol } of SERVERS) {
					const { host, port } = servers[protocol];
					await proxy.servers[protocol].set('host', host.trim());
					await proxy.servers[protocol].set('port', host.trim() ? Number(port) : 0);
				}
				await proxy.main.set('ignore-hosts', words(skip));
			}
			await proxy.main.set('mode', mode);
			onclose();
		} catch {
			problem = "Couldn't save the proxy settings";
			saving = false;
		}
	}
</script>

<Dialog title="Proxy" description="Send web traffic through another server, often needed on work or school networks." {onclose}>
	<Segmented label="Proxy" options={MODES} value={mode} onchange={(next) => (mode = next)} />
	{#if mode === 'auto'}
		<div class="field">
			<span class="label">Configuration address</span>
			<TextField label="Configuration address" bind:value={url} placeholder="http://example.com/proxy.pac" type="url" error={errors.url} />
		</div>
	{:else if mode === 'manual'}
		{#each SERVERS as { protocol, label } (protocol)}
			<div class="field">
				<span class="label">{label}</span>
				<div class="flex gap-2">
					<div class="min-w-0 flex-1">
						<TextField
							label="{label} server"
							bind:value={servers[protocol].host}
							bind:touched={touched[protocol].host}
							placeholder="Server"
							invalid={Boolean(errors[`${protocol}.host`])}
						/>
					</div>
					<div class="w-[96px]">
						<TextField
							label="{label} port"
							bind:value={servers[protocol].port}
							bind:touched={touched[protocol].port}
							placeholder="Port"
							inputmode="numeric"
							invalid={Boolean(errors[`${protocol}.port`])}
						/>
					</div>
				</div>
				{#if message(protocol)}
					<p class="px-3.5 text-[12.5px] text-[var(--danger)]">{message(protocol)}</p>
				{/if}
			</div>
		{/each}
		<div class="field">
			<span class="label">Don’t use the proxy for</span>
			<TextField label="Don’t use the proxy for" bind:value={skip} placeholder="localhost, *.example.com" />
		</div>
	{/if}
	{#if problem}
		<p class="text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!ready} onclick={save}>{saving ? 'Saving…' : 'Save'}</button>
	{/snippet}
</Dialog>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.label {
		padding-inline: 4px;
		font-size: 13px;
		color: var(--text-soft);
	}
</style>
