<script lang="ts">
	import { Row } from '@luft/ui';
	import type { CustomDomainState } from '../store';
	import CopyLine from './CopyLine.svelte';
	import { since } from '../format';

	const STATUS: Record<CustomDomainState['status'], string> = {
		proving: 'Waiting for the TXT record',
		connecting: 'Connecting',
		active: 'Serving download links',
		paused: 'Paused'
	};

	let { domain, oncheck }: { domain: CustomDomainState; oncheck?: () => Promise<void> } = $props();
	let checking = $state(false);

	async function check() {
		checking = true;
		await oncheck?.();
		checking = false;
	}
</script>

<Row title={domain.domain} description={[STATUS[domain.status], domain.waiting, domain.checked_at ? `checked ${since(domain.checked_at)}` : null].filter(Boolean).join(' · ')}>
	{#if oncheck && domain.status !== 'active'}
		<button type="button" class="button" disabled={checking} onclick={check}>Check again</button>
	{/if}
</Row>
{#each domain.records as record (record.type + record.name)}
	<Row title="{record.type} record for {record.name}">
		{#snippet below()}<CopyLine text={record.value} label="Copy the value" />{/snippet}
	</Row>
{/each}
