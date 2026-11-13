<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
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
				return 'Approved and done.';
			case 'failed':
				return 'Approved, but not everything happened.';
			case 'cancelled':
				return 'The request was cancelled.';
			case 'expired':
				return 'The request ran out before it was approved.';
			default:
				return approval?.passkey ? 'Approve it in your browser with your passkey.' : 'Approve it in your browser.';
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
			<button type="button" class="button" onclick={() => approvals.cancel()}>Cancel</button>
			<button type="button" class="button primary" disabled={!approval} onclick={() => approvals.openPage()}>Open the page again</button>
		{:else}
			<button type="button" class="button primary" onclick={() => approvals.close()}>Done</button>
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
