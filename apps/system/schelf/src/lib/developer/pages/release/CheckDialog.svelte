<script lang="ts">
	import { Dialog } from '@luft/ui';
	import { CHECK_TITLES } from '../../format';
	import type { CheckResult, Release } from '../../store';
	import { readable } from './checks';

	const FIXES: Partial<Record<CheckResult['name'], string>> = {
		namespace: 'Prove the namespace your app id is under, then publish again.',
		version: 'Publish a release with a version higher than your last one.',
		platforms: 'Name each file for its system, like …-linux-x86_64.AppImage.',
		files: 'Publish again from the same workflow.',
		attestation: 'Give the publish job attestations: write, and publish from the workflow you connected.',
		listing: 'Fill in what the listing is missing, then publish again.',
		permissions: 'If it really needs more, say why in the release notes. People are asked before they update.',
		impersonation: 'A person looks at this in review. If the name is yours, there is nothing to do.',
		licence: 'Add a LICENSE file with an open licence, or set it in the listing.'
	};

	let { check, release, onclose }: { check: CheckResult; release: Release; onclose: () => void } = $props();

	const fix = $derived(check.status === 'passed' && !release.permissions_widened ? undefined : FIXES[check.name]);
	const pairs = $derived(readable(check.detail));
</script>

<Dialog title={CHECK_TITLES[check.name]} description={check.summary} wide {onclose}>
	{#if fix}
		<p class="text-[13.5px] text-[var(--text-soft)]">{fix}</p>
	{/if}
	{#if pairs}
		<dl class="detail grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
			{#each pairs as [label, value] (label)}
				<dt class="text-[var(--text-muted)]">{label}</dt>
				<dd class="min-w-0 break-words">{value}</dd>
			{/each}
		</dl>
	{:else}
		<pre class="detail">{JSON.stringify(check.detail, null, 2)}</pre>
	{/if}
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>Done</button>
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
