<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Info from '@lucide/svelte/icons/info';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { Dialog } from '@luft/ui';
	import type { Action, Level } from '#lib/api/meet.js';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import { session } from '#lib/state/meet.svelte.js';

	const ICONS = { fine: CircleCheck, note: Info, blocks: CircleX };
	const ORDER: Record<Level, number> = { blocks: 0, note: 1, fine: 2 };
	type Confirmed = Exclude<Action, 'chooseIso'>;

	const LABELS: Record<Action, string> = {
		firmwareSettings: 'Open firmware settings',
		tidy: 'Tidy up',
		chooseIso: 'Use an ISO I already have'
	};
	const CONFIRMATIONS: Record<Confirmed, { title: string; description: string; confirm: string }> = {
		firmwareSettings: {
			title: 'Restart into the firmware settings?',
			description: 'Save anything you’re working on first. Turn on Secure Boot there, save, and Windows starts again as usual.',
			confirm: 'Restart'
		},
		tidy: {
			title: 'Remove the old start entries?',
			description: 'They only point at systems that are already gone. Windows and everything else start just like before.',
			confirm: 'Remove'
		}
	};

	const PATIENCE = 15_000;

	let confirming = $state<Confirmed | null>(null);
	let slow = $state(false);

	$effect(() => {
		if (session.report || session.failure) return;
		slow = false;
		const timer = setTimeout(() => (slow = true), PATIENCE);
		return () => clearTimeout(timer);
	});

	function start(action: Action) {
		if (action === 'chooseIso') void session.act(action);
		else confirming = action;
	}

	function act() {
		const action = confirming!;
		confirming = null;
		void session.act(action);
	}

	let findings = $derived([...(session.report?.findings ?? [])].sort((a, b) => ORDER[a.level] - ORDER[b.level]));
	let title = $derived(!session.report ? 'Looking at this PC' : session.blocked ? 'Almost there' : 'This PC is ready for Luft');
	let description = $derived(
		!session.report
			? slow
				? 'Windows is working out how much room it can spare. On a big drive this can take a few minutes.'
				: 'This takes a moment.'
			: session.blocked
				? 'Something needs to change before Luft can move in. Here’s what to do.'
				: 'Here’s what Meet Luft found.'
	);
</script>

<Frame {title} {description} onback={() => session.go('hello')}>
	{#if !session.report}
		<div class="flex items-center gap-3 py-2 text-[14px] text-[var(--text-soft)]">
			{#if session.failure}
				<Problem failure={session.failure} />
			{:else}
				<LoaderCircle size={18} class="animate-spin" />Checking the drive, the firmware and the hardware…
			{/if}
		</div>
	{:else}
		<ul class="flex flex-col gap-1">
			{#each findings as finding (finding.topic)}
				{@const Icon = ICONS[finding.level]}
				<li class="finding" data-level={finding.level}>
					<span class="icon"><Icon size={19} /></span>
					<span class="flex min-w-0 flex-col gap-0.5">
						<span class="text-[15px] font-medium">{finding.title}</span>
						<span class="text-[13.5px] leading-snug text-[var(--text-soft)]">{finding.detail}</span>
						{#if finding.action}
							<button type="button" class="plain-button -ml-3 mt-1 self-start" disabled={session.busy} onclick={() => start(finding.action!)}>
								{LABELS[finding.action]}
							</button>
						{/if}
					</span>
				</li>
			{/each}
		</ul>
		{#if session.failure}
			<div class="mt-3 px-3.5"><Problem failure={session.failure} /></div>
		{/if}
	{/if}
	{#snippet actions()}
		{#if session.report && session.blocked}
			<button type="button" class="button large px-6" disabled={session.busy} onclick={() => session.check()}>Check again</button>
		{:else if session.report}
			<button type="button" class="button primary large px-6" onclick={() => session.go('room')}>Continue</button>
		{/if}
	{/snippet}
</Frame>

{#if confirming}
	<Dialog title={CONFIRMATIONS[confirming].title} description={CONFIRMATIONS[confirming].description} onclose={() => (confirming = null)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (confirming = null)}>Cancel</button>
			<button type="button" class="button primary" onclick={act}>{CONFIRMATIONS[confirming!].confirm}</button>
		{/snippet}
	</Dialog>
{/if}

<style>
	.finding {
		display: flex;
		gap: 14px;
		border-radius: 16px;
		padding: 11px 14px;
	}

	.icon {
		margin-top: 1px;
		flex: none;
		color: var(--text-muted);
	}

	[data-level='fine'] .icon {
		color: var(--accent);
	}

	[data-level='blocks'] {
		background: color-mix(in oklab, var(--danger) 10%, transparent);
	}

	[data-level='blocks'] .icon {
		color: var(--danger);
	}
</style>
