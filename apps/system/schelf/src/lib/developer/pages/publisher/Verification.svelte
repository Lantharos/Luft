<script lang="ts">
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import { Row, Section } from '@luft/ui';
	import { openUrl } from '#lib/bridge/index.js';
	import Loaded from '../../components/Loaded.svelte';
	import { day } from '../../format';
	import { reads } from '../../state/reads';
	import type { DashboardPublisher, VerificationStatus } from '../../store';

	const STATUS: Record<VerificationStatus, string> = {
		draft: 'Started, not sent yet',
		open: 'Waiting for a reviewer',
		'more-requested': 'The reviewer asked for more',
		approved: 'Approved',
		rejected: 'Turned down',
		revoked: 'Taken back'
	};

	const GIVES = ['A check mark next to its name on every page', 'Short tool names, like sch add lumi', 'Extensions that may run inside Luft', 'Download links on its own domain'];

	let { publisher }: { publisher: DashboardPublisher } = $props();

	const verification = $derived(reads.verification(publisher.id));
	const namespaces = $derived(reads.namespaces(publisher.id));
	const page = 'https://schelf.store/dashboard/settings/verification';

	$effect(() => verification.watch());
	$effect(() => namespaces.watch());
</script>

<Loaded resource={verification}>
	{#snippet children(state)}
		{@const current = state.current}
		<Section>
			<Row title={state.verified ? `${publisher.name} is verified` : `${publisher.name} isn't verified`} icon={state.verified ? BadgeCheck : undefined} description={current?.decided_at ? `${STATUS[current.status]} ${day(current.decided_at)}` : current ? STATUS[current.status] : undefined}>
				{#if publisher.role === 'owner'}
					<button type="button" class="button" onclick={() => openUrl(page)}>{state.verified ? 'Open in the browser' : current ? 'Continue in the browser' : 'Start in the browser'}</button>
				{/if}
			</Row>
			{#if current?.reason}
				<Row title="The reviewer's reason" description={current.reason} />
			{/if}
			{#if current?.legal_name}
				<Row title="Legal name"><span>{current.legal_name}</span></Row>
			{/if}
			{#each current?.domains ?? [] as domain (domain.name)}
				<Row title={domain.name} description={domain.proof ? `Proven by ${domain.proof === 'well-known' ? 'a file on the website' : domain.proof === 'dns' ? 'a DNS record' : 'a namespace'}` : 'Not proven yet'} />
			{/each}
		</Section>
		<Section title={state.verified ? 'What it gives' : 'What it would give'}>
			{#each GIVES as give (give)}
				<Row title={give} />
			{/each}
		</Section>
	{/snippet}
</Loaded>

<Loaded resource={namespaces}>
	{#snippet children(list)}
		{#if list.length}
			<Section title="Namespaces">
				{#each list as namespace (namespace.prefix)}
					<Row title={namespace.prefix} description={namespace.verified ? `Proven ${namespace.verified_at ? day(namespace.verified_at) : ''}` : 'Not proven yet'} />
				{/each}
			</Section>
		{/if}
	{/snippet}
</Loaded>
