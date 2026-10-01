<script lang="ts">
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { Row, Switch } from '@luft/ui';
	import { problem, restart, type Disk, type Tpm } from '../api';
	import { progressLine, unlockSummary } from './describe';
	import TurnOffDialog from './TurnOffDialog.svelte';
	import TurnOnDialog from './TurnOnDialog.svelte';

	let { disk, tpm }: { disk: Disk; tpm: Tpm } = $props();

	let open = $state<'on' | 'off' | null>(null);
	let busy = $state(false);
	let error = $state('');

	async function restartNow() {
		busy = true;
		error = '';
		try {
			await restart();
		} catch (reason) {
			error = problem(reason);
		}
		busy = false;
	}
</script>

{#snippet progress()}
	<div class="h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
		<div class="bar h-full rounded-full bg-[var(--accent)]" style:width="{disk.progress * 100}%"></div>
	</div>
{/snippet}

{#snippet failure()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

{#if disk.state === 'encrypting'}
	<Row title="Encrypting this device" description={progressLine(disk)} icon={LockKeyhole} below={progress} />
{:else if disk.state === 'decrypting'}
	<Row title="Turning off device encryption" description={progressLine(disk)} icon={LockKeyhole} below={progress} />
{:else if disk.state === 'starting'}
	<Row title="Device encryption" description="Starts the next time you restart" icon={LockKeyhole} below={error ? failure : undefined}>
		<button type="button" class="button primary" disabled={busy} onclick={restartNow}>Restart</button>
	</Row>
{:else if disk.state === 'on'}
	<Row title="Device encryption" description={unlockSummary(disk)} icon={LockKeyhole}>
		<Switch label="Device encryption" checked onchange={() => (open = 'off')} />
	</Row>
{:else if disk.device}
	<Row title="Device encryption" description="Keeps your files private if this computer is lost" icon={LockKeyhole}>
		<button type="button" class="button" onclick={() => (open = 'on')}>Turn on</button>
	</Row>
{/if}

{#if open === 'on'}
	<TurnOnDialog {tpm} onclose={() => (open = null)} />
{:else if open === 'off'}
	<TurnOffDialog onclose={() => (open = null)} />
{/if}

<style>
	.bar {
		transition: width 240ms var(--ease);
	}
</style>
