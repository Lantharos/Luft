<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import DomainRows from '../../components/DomainRows.svelte';
	import Loaded from '../../components/Loaded.svelte';
	import { act } from '../../state/act';
	import { approvals } from '../../state/approval.svelte';
	import { developer } from '../../state/developer.svelte';
	import { reads } from '../../state/reads';
	import type { DashboardPublisher } from '../../store';
	import DomainDialog from './DomainDialog.svelte';

	let { publisher }: { publisher: DashboardPublisher } = $props();

	const domain = $derived(reads.domain(publisher.id));
	const manages = $derived(publisher.role !== 'developer');
	let choosing = $state(false);

	$effect(() => domain.watch());

	async function check() {
		const checked = await act(commands.developerCheckDomain({ publisher: publisher.id }), 'Checked the domain again');
		if (checked !== null) domain.set(checked);
	}

	function ask(next: string | null) {
		choosing = false;
		const title = next ? `Serve downloads on ${next}` : 'Stop serving downloads on your domain';
		void approvals.ask(title, [{ type: 'publisher.domain', publisher: publisher.id, domain: next }], () => developer.resources.expire(`domain:${publisher.id}`));
	}
</script>

<Loaded resource={domain}>
	{#snippet children(state)}
		{#if state}
			<Section>
				<DomainRows domain={state} oncheck={manages ? check : undefined} />
				{#if manages}
					<Row title="Stop using {state.domain}">
						<button type="button" class="button" onclick={() => ask(null)}>Stop</button>
					</Row>
				{/if}
			</Section>
		{:else}
			<Section>
				<Row title="Download links are on dl.schelf.store">
					{#if manages}
						<button type="button" class="button" onclick={() => (choosing = true)}>Use a domain</button>
					{/if}
				</Row>
			</Section>
		{/if}
	{/snippet}
</Loaded>

{#if choosing}
	<DomainDialog onclose={() => (choosing = false)} onchoose={ask} />
{/if}
