<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { checkTitle } from '../../format';
	import type { CheckResult, Release } from '../../store';
	import { readable } from './checks';

	const FIXES: Partial<Record<CheckResult['name'], string>> = {
		namespace: 'developer-fix-namespace',
		version: 'developer-fix-version',
		platforms: 'developer-fix-platforms',
		files: 'developer-fix-files',
		attestation: 'developer-fix-attestation',
		listing: 'developer-fix-listing',
		permissions: 'developer-fix-permissions',
		impersonation: 'developer-fix-impersonation',
		licence: 'developer-fix-licence'
	};

	let { check, release, onclose }: { check: CheckResult; release: Release; onclose: () => void } = $props();

	const fix = $derived(check.status === 'passed' && !release.permissions_widened ? undefined : FIXES[check.name]);
	const pairs = $derived(readable(check.detail));
</script>

<Dialog title={checkTitle(check.name)} description={check.summary} wide {onclose}>
	{#if fix}
		<p class="text-[13.5px] text-[var(--text-soft)]">{t(fix)}</p>
	{/if}
	{#if pairs}
		<dl class="detail select-text grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
			{#each pairs as [label, value] (label)}
				<dt class="text-[var(--text-muted)]">{label}</dt>
				<dd class="min-w-0 break-words">{value}</dd>
			{/each}
		</dl>
	{:else}
		<pre class="detail select-text">{JSON.stringify(check.detail, null, 2)}</pre>
	{/if}
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('developer-done')}</button>
	{/snippet}
</Dialog>

<style>
	.detail {
		max-height: 320px;
		overflow: auto;
		border-radius: 12px;
		background: var(--control);
		padding: 12px 14px;
		font-size: 13px;
		line-height: 1.5;
	}

	pre.detail {
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--text-soft);
	}
</style>
