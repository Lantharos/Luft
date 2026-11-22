<script lang="ts">
	import BadgeCheck from '@luft/symbols/icons/badge-check';
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import { openUrl } from '#lib/bridge/index.js';
	import Loaded from '../../components/Loaded.svelte';
	import { day } from '../../format';
	import { reads } from '../../state/reads';
	import type { DashboardPublisher, VerificationStatus } from '../../store';

	const STATUS: Record<VerificationStatus, string> = {
		draft: 'developer-verification-draft',
		open: 'developer-verification-open',
		'more-requested': 'developer-verification-more-requested',
		approved: 'developer-verification-approved',
		rejected: 'developer-verification-rejected',
		revoked: 'developer-verification-revoked'
	};

	const GIVES = ['developer-verification-gives-mark', 'developer-verification-gives-short', 'developer-verification-gives-extensions', 'developer-verification-gives-domain'];

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
			<Row
				title={t(state.verified ? 'developer-verification-verified' : 'developer-verification-unverified', { publisher: publisher.name })}
				icon={state.verified ? BadgeCheck : undefined}
				description={current?.decided_at
					? t('developer-verification-decided', { status: t(STATUS[current.status]), date: day(current.decided_at) })
					: current
						? t(STATUS[current.status])
						: undefined}
			>
				{#if publisher.role === 'owner'}
					<button type="button" class="button" onclick={() => openUrl(page)}>{t(state.verified ? 'developer-verification-open-browser' : current ? 'developer-verification-continue-browser' : 'developer-verification-start-browser')}</button>
				{/if}
			</Row>
			{#if current?.reason}
				<Row title={t('developer-verification-reason')} description={current.reason} />
			{/if}
			{#if current?.legal_name}
				<Row title={t('developer-verification-legal-name')}><span>{current.legal_name}</span></Row>
			{/if}
			{#each current?.domains ?? [] as domain (domain.name)}
				<Row title={domain.name} description={domain.proof ? t('developer-verification-proven-by', { proof: domain.proof }) : t('developer-not-proven')} />
			{/each}
		</Section>
		<Section title={t(state.verified ? 'developer-verification-gives' : 'developer-verification-would-give')}>
			{#each GIVES as give (give)}
				<Row title={t(give)} />
			{/each}
		</Section>
	{/snippet}
</Loaded>

<Loaded resource={namespaces}>
	{#snippet children(list)}
		{#if list.length}
			<Section title={t('developer-verification-namespaces')}>
				{#each list as namespace (namespace.prefix)}
					<Row title={namespace.prefix} description={namespace.verified ? (namespace.verified_at ? t('developer-verification-proven-on', { date: day(namespace.verified_at) }) : t('developer-verification-proven')) : t('developer-not-proven')} />
				{/each}
			</Section>
		{/if}
	{/snippet}
</Loaded>
