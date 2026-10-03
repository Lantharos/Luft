<script lang="ts">
	import { Segmented, TextField } from '@luft/ui';
	import type { Security, Server } from '#lib/api/index.js';

	interface Props {
		title: string;
		server: Server;
	}

	let { title, server = $bindable() }: Props = $props();

	const SECURITY: { value: Security; label: string }[] = [
		{ value: 'tls', label: 'TLS' },
		{ value: 'startTls', label: 'STARTTLS' },
		{ value: 'none', label: 'None' }
	];

	let port = $state(String(server.port));

	$effect(() => {
		const parsed = Number.parseInt(port, 10);
		if (Number.isFinite(parsed) && parsed > 0 && parsed < 65536) server.port = parsed;
	});
</script>

<div class="flex flex-col gap-2">
	<p class="px-1 text-[13px] font-medium text-[var(--text-soft)]">{title}</p>
	<div class="flex gap-2">
		<div class="min-w-0 flex-1"><TextField bind:value={server.host} label="{title} server" placeholder="imap.example.com" /></div>
		<div class="w-[88px] flex-none"><TextField bind:value={port} label="{title} port" inputmode="numeric" /></div>
	</div>
	<Segmented options={SECURITY} value={server.security} label="{title} security" onchange={(security) => (server.security = security)} />
</div>
