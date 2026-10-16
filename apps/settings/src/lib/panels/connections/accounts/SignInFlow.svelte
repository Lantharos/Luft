<script lang="ts">
	import { onDestroy } from 'svelte';
	import Copy from '@lucide/svelte/icons/copy';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import { Choice, TextField } from '@luft/ui';
	import { answer, onStep, openAddress, step as currentStep, type Step } from './api';

	interface Props {
		session: string;
		providerName: string;
		step: Step;
		code: string;
	}

	let { session, providerName, step = $bindable(), code = $bindable() }: Props = $props();

	let opened = $state('');
	let copied = $state(false);
	let problem = $state('');

	const stop = onStep((update) => {
		if (update.session === session) receive(update.step);
	});
	onDestroy(stop);

	function receive(next: Step) {
		step = next;
		if (next.step === 'code') code = '';
		if (next.step === 'browser' && opened !== next.url) {
			opened = next.url;
			void open(next.url);
		}
	}

	async function open(url: string) {
		problem = '';
		await openAddress(url).catch(() => (problem = 'No browser opened. Copy the link and open it in a browser.'));
	}

	async function copy(url: string) {
		await navigator.clipboard.writeText(url);
		copied = true;
	}

	export async function submitCode() {
		const digits = code.replace(/\D/g, '');
		if (digits.length !== 6) return;
		step = { step: 'working' };
		await answer(session, { kind: 'code', code: digits });
	}

	async function textMe() {
		step = { step: 'working' };
		await answer(session, { kind: 'text' });
	}

	async function choosePhone(id: string) {
		step = { step: 'working' };
		await answer(session, { kind: 'phone', id });
	}

	$effect(() => {
		if (session) void currentStep(session).then(receive).catch(() => {});
	});
</script>

{#if step.step === 'working'}
	<div class="flex items-center gap-3 py-2 text-[14px] text-[var(--text-soft)]">
		<LoaderCircle size={18} class="animate-spin text-[var(--text-muted)]" />
		Talking to {providerName}…
	</div>
{:else if step.step === 'browser'}
	{@const url = step.url}
	<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">
		Finish signing in with {providerName} in your browser. Luft never sees your password, and this updates on its own once you’re done.
	</p>
	<div class="flex flex-wrap gap-2">
		<button type="button" class="plain-button" onclick={() => open(url)}><ExternalLink size={15} /> Open the page again</button>
		<button type="button" class="plain-button" onclick={() => copy(url)}><Copy size={15} /> {copied ? 'Copied' : 'Copy the link'}</button>
	</div>
{:else if step.step === 'code'}
	<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">{step.prompt}</p>
	<TextField
		bind:value={code}
		label="Verification code"
		placeholder="6-digit code"
		inputmode="numeric"
		autocomplete="one-time-code"
		onkeydown={(event) => event.key === 'Enter' && void submitCode()}
	/>
	{#if !step.texted}
		<button type="button" class="plain-button self-start" onclick={textMe}>Text me a code instead</button>
	{/if}
{:else if step.step === 'phones'}
	<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">Which number should Apple text the code to?</p>
	<div class="-mx-2 flex flex-col">
		{#each step.phones as phone (phone.id)}
			<Choice icon={Smartphone} title={phone.number} description="Send a text message" onclick={() => choosePhone(phone.id)} />
		{/each}
	</div>
{:else if step.step === 'approve'}
	<div class="flex items-start gap-3 py-1 text-[14px] leading-relaxed text-[var(--text-soft)]">
		<LoaderCircle size={18} class="mt-0.5 flex-none animate-spin text-[var(--text-muted)]" />
		<span>Your Apple Account uses Advanced Data Protection. Approve the request on your iPhone, iPad or Mac to let this computer open iCloud Drive.</span>
	</div>
{:else if step.step === 'failed'}
	<p class="text-[14px] leading-relaxed text-[var(--danger)]">{step.message}</p>
{/if}

{#if problem}
	<p class="text-[12.5px] text-[var(--text-muted)]">{problem}</p>
{/if}
