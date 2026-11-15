<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented, TextField } from '@luft/ui';
	import type { Security, Server } from '#lib/bindings.js';

	interface Props {
		kind: 'incoming' | 'outgoing';
		server: Server;
	}

	let { kind, server = $bindable() }: Props = $props();

	let security = $derived<{ value: Security; label: string }[]>([
		{ value: 'tls', label: 'TLS' },
		{ value: 'startTls', label: 'STARTTLS' },
		{ value: 'none', label: t('mailman-server-unencrypted') }
	]);

	let port = $state(String(server.port));

	$effect(() => {
		const parsed = Number.parseInt(port, 10);
		if (Number.isFinite(parsed) && parsed > 0 && parsed < 65536) server.port = parsed;
	});
</script>

<div class="flex flex-col gap-2">
	<p class="px-1 text-[13px] font-medium text-[var(--text-soft)]">{t('mailman-server-title', { kind })}</p>
	<div class="flex gap-2">
		<div class="min-w-0 flex-1"><TextField bind:value={server.host} label={t('mailman-server-host', { kind })} placeholder="imap.example.com" /></div>
		<div class="w-[88px] flex-none"><TextField bind:value={port} label={t('mailman-server-port', { kind })} inputmode="numeric" /></div>
	</div>
	<Segmented options={security} value={server.security} label={t('mailman-server-security', { kind })} onchange={(security) => (server.security = security)} />
</div>
