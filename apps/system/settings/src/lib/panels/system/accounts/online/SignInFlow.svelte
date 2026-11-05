<script lang="ts">
	import { onDestroy } from 'svelte';
	import Copy from '@lucide/svelte/icons/copy';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import { t } from '@luft/i18n';
	import { Choice, TextField } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { Step } from '#lib/bindings.js';
	import { openAddress } from './api';

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

	const stop = events.accountsStep((update) => {
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
		await openAddress(url).catch(() => (problem = t('settings-accounts-no-browser')));
	}

	async function copy(url: string) {
		await navigator.clipboard.writeText(url);
		copied = true;
	}

	export async function submitCode() {
		const digits = code.replace(/\D/g, '');
		if (digits.length !== 6) return;
		step = { step: 'working' };
		await commands.accountsAnswer({ session, answer: { kind: 'code', code: digits } });
	}

	async function textMe() {
		step = { step: 'working' };
		await commands.accountsAnswer({ session, answer: { kind: 'text' } });
	}

	async function choosePhone(id: string) {
		step = { step: 'working' };
		await commands.accountsAnswer({ session, answer: { kind: 'phone', id } });
	}

	$effect(() => {
		if (session) void commands.accountsStep({ session }).then(receive).catch(() => {});
	});
</script>

{#if step.step === 'working'}
	<div class="flex items-center gap-3 py-2 text-[14px] text-[var(--text-soft)]">
		<LoaderCircle size={18} class="animate-spin text-[var(--text-muted)]" />
		{t('settings-accounts-working', { provider: providerName })}
	</div>
{:else if step.step === 'browser'}
	{@const url = step.url}
	<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">
		{t('settings-accounts-finish-in-browser', { provider: providerName })}
	</p>
	<div class="flex flex-wrap gap-2">
		<button type="button" class="plain-button" onclick={() => open(url)}><ExternalLink size={15} /> {t('settings-accounts-open-again')}</button>
		<button type="button" class="plain-button" onclick={() => copy(url)}><Copy size={15} /> {copied ? t('settings-accounts-copied') : t('settings-accounts-copy-link')}</button>
	</div>
{:else if step.step === 'code'}
	<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">{step.prompt}</p>
	<TextField
		bind:value={code}
		label={t('settings-accounts-code')}
		placeholder={t('settings-accounts-code.placeholder')}
		inputmode="numeric"
		autocomplete="one-time-code"
		onkeydown={(event) => event.key === 'Enter' && void submitCode()}
	/>
	{#if !step.texted}
		<button type="button" class="plain-button self-start" onclick={textMe}>{t('settings-accounts-text-me')}</button>
	{/if}
{:else if step.step === 'phones'}
	<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">{t('settings-accounts-choose-phone')}</p>
	<div class="-mx-2 flex flex-col">
		{#each step.phones as phone (phone.id)}
			<Choice icon={Smartphone} title={phone.number} description={t('settings-accounts-choose-phone.description')} onclick={() => choosePhone(phone.id)} />
		{/each}
	</div>
{:else if step.step === 'approve'}
	<div class="flex items-start gap-3 py-1 text-[14px] leading-relaxed text-[var(--text-soft)]">
		<LoaderCircle size={18} class="mt-0.5 flex-none animate-spin text-[var(--text-muted)]" />
		<span>{t('settings-accounts-approve')}</span>
	</div>
{:else if step.step === 'failed'}
	<p class="text-[14px] leading-relaxed text-[var(--danger)]">{step.message}</p>
{/if}

{#if problem}
	<p class="text-[12.5px] text-[var(--text-muted)]">{problem}</p>
{/if}
