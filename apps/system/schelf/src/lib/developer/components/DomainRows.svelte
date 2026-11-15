<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row } from '@luft/ui';
	import type { CustomDomainState } from '../store';
	import CopyLine from './CopyLine.svelte';
	import { since } from '../format';

	const STATUS: Record<CustomDomainState['status'], string> = {
		proving: 'developer-domain-proving',
		connecting: 'developer-domain-connecting',
		active: 'developer-domain-active',
		paused: 'developer-domain-paused'
	};

	let { domain, oncheck }: { domain: CustomDomainState; oncheck?: () => Promise<void> } = $props();
	let checking = $state(false);

	async function check() {
		checking = true;
		await oncheck?.();
		checking = false;
	}
</script>

<Row title={domain.domain} description={[t(STATUS[domain.status]), domain.waiting, domain.checked_at ? t('developer-domain-checked', { when: since(domain.checked_at) }) : null].filter(Boolean).join(' · ')}>
	{#if oncheck && domain.status !== 'active'}
		<button type="button" class="button" disabled={checking} onclick={check}>{t('developer-domain-check-again')}</button>
	{/if}
</Row>
{#each domain.records as record (record.type + record.name)}
	<Row title={t('developer-domain-record', { type: record.type, name: record.name })}>
		{#snippet below()}<CopyLine text={record.value} label={t('developer-domain-copy-value')} />{/snippet}
	</Row>
{/each}
