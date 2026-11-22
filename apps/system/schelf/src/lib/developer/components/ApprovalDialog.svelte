<script lang="ts">
	import Check from '@luft/symbols/icons/check';
	import X from '@luft/symbols/icons/x';
	import { t } from '@luft/i18n';
	import { Dialog, Spinner } from '@luft/ui';
	import { problemText } from '../state/act';
	import { approvals, type Asking } from '../state/approval.svelte';

	let { asking }: { asking: Asking } = $props();

	const approval = $derived(asking.step === 'asked' ? asking.approval : null);
	const pending = $derived(asking.step === 'starting' || approval?.status === 'pending');

	const description = $derived.by(() => {
		if (asking.step === 'problem') return problemText(asking.problem);
		switch (approval?.status) {
			case 'done':
				return t('developer-approval-done');
			case 'failed':
				return t('developer-approval-failed');
			case 'cancelled':
				return t('developer-approval-cancelled');
			case 'expired':
				return t('developer-approval-expired');
			default:
				return t(approval?.passkey ? 'developer-approval-passkey' : 'developer-approval-browser');
		}
	});
</script>

<Dialog title={approvals.title} {description} onclose={() => (pending ? approvals.cancel() : approvals.close())}>
	{#if approval}
		<ul class="flex flex-col gap-2.5">
			{#each approval.steps as step (step.summary)}
				<li class="step">
					<span class="mark">
						{#if step.outcome === 'done'}
							<Check size={16} />
						{:else if step.outcome === 'failed'}
							<X size={16} class="text-[var(--danger)]" />
						{:else if approval.status === 'pending'}
							<Spinner size={14} />
						{/if}
					</span>
					<span class="flex flex-col gap-0.5">
						<span>{step.summary}</span>
						{#if step.detail}
							<span class="text-[12.5px] text-[var(--danger)]">{step.detail}</span>
						{/if}
					</span>
				</li>
			{/each}
		</ul>
	{/if}
	{#snippet actions()}
		{#if pending}
			<button type="button" class="button" onclick={() => approvals.cancel()}>{t('developer-cancel')}</button>
			<button type="button" class="button primary" disabled={!approval} onclick={() => approvals.openPage()}>{t('developer-approval-open-again')}</button>
		{:else}
			<button type="button" class="button primary" onclick={() => approvals.close()}>{t('developer-done')}</button>
		{/if}
	{/snippet}
</Dialog>

<style>
	.step {
		display: flex;
		gap: 10px;
		font-size: 14px;
	}

	.mark {
		display: grid;
		width: 18px;
		height: 20px;
		flex: none;
		place-items: center;
		color: var(--text-soft);
	}
</style>
