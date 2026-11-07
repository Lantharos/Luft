<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Segmented, Spinner, TextField } from '@luft/ui';
	import type { OpenPort, Protocol } from '@luft/network';
	import { portProblem, protocolLabel } from './ports';

	interface Props {
		onopen: (port: OpenPort) => Promise<boolean>;
	}

	let { onopen }: Props = $props();

	let port = $state('');
	let protocol = $state<Protocol>('tcp');
	let opening = $state(false);

	let problem = $derived(portProblem(port));
	let ready = $derived(Boolean(port.trim()) && !problem && !opening);
	let protocols = $derived<{ value: Protocol; label: string }[]>([
		{ value: 'tcp', label: protocolLabel('tcp') },
		{ value: 'udp', label: protocolLabel('udp') }
	]);

	async function open() {
		if (!ready) return;
		opening = true;
		if (await onopen({ port: Number(port), protocol })) port = '';
		opening = false;
	}
</script>

<Row title={t('settings-network-firewall-open-port')} description={t('settings-network-firewall-open-port.description')}>
	{#snippet below()}
		<div class="flex items-center gap-2">
			<div class="w-[120px]">
				<TextField
					label={t('settings-network-firewall-port-number')}
					bind:value={port}
					placeholder={t('settings-network-firewall-port-number')}
					inputmode="numeric"
					invalid={Boolean(problem)}
					onkeydown={(event) => event.key === 'Enter' && open()}
				/>
			</div>
			<Segmented label={t('settings-network-firewall-protocol')} options={protocols} value={protocol} onchange={(next) => (protocol = next)} />
			<button type="button" class="button ml-auto" disabled={!ready} onclick={open}>
				{#if opening}<Spinner />{/if}{opening ? t('settings-network-firewall-opening') : t('settings-network-firewall-open')}
			</button>
		</div>
		{#if problem}
			<p class="px-3.5 text-[12.5px] text-[var(--danger)]">{problem}</p>
		{/if}
	{/snippet}
</Row>
