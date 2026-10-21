<script lang="ts" module>
	export type EncryptionStep = 'check' | 'key' | 'unlock' | 'summary';

	export interface EncryptionCheck {
		id: string;
		passed: boolean;
		sentence: string;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import { t } from '@luft/i18n';
	import Checkbox from '../controls/Checkbox.svelte';
	import Dialog from '../dialogs/Dialog.svelte';
	import { errorText } from '../text/errors';
	import RecoveryKey from './RecoveryKey.svelte';

	interface Props {
		titles: Record<EncryptionStep, string>;
		descriptions: Partial<Record<EncryptionStep, string>>;
		check: () => Promise<EncryptionCheck[]>;
		blocked: boolean;
		advice?: string;
		recoveryKey: () => Promise<string>;
		onsave: (key: string) => Promise<boolean>;
		onprint: (key: string) => Promise<boolean>;
		unlock: Snippet<[next: () => void]>;
		unlockReady: boolean;
		summary: string[];
		finish: string;
		finishing: string;
		danger?: boolean;
		onfinish: (key: string) => Promise<void>;
		explain?: (reason: unknown) => string;
		onclose: () => void;
	}

	let {
		titles,
		descriptions,
		check,
		blocked,
		advice,
		recoveryKey,
		onsave,
		onprint,
		unlock,
		unlockReady,
		summary,
		finish,
		finishing,
		danger = false,
		onfinish,
		explain = errorText,
		onclose
	}: Props = $props();

	const STEPS: EncryptionStep[] = ['check', 'key', 'unlock', 'summary'];

	let step = $state<EncryptionStep>('check');
	let checks = $state.raw<EncryptionCheck[] | null>(null);
	let key = $state('');
	let kept = $state(false);
	let busy = $state(false);
	let error = $state('');

	async function attempt<T>(action: () => Promise<T>): Promise<T | undefined> {
		busy = true;
		error = '';
		try {
			return await action();
		} catch (reason) {
			error = explain(reason);
		} finally {
			busy = false;
		}
	}

	void attempt(() => check()).then((results) => (checks = results ?? null));

	async function next() {
		if (step === 'check' && !key) key = (await attempt(recoveryKey)) ?? '';
		if (step === 'check' && !key) return;
		step = STEPS[STEPS.indexOf(step) + 1];
	}

	const back = () => (step = STEPS[STEPS.indexOf(step) - 1]);
	const submitUnlock = () => unlockReady && next();

	async function encrypt() {
		const started = await attempt(async () => {
			await onfinish(key);
			return true;
		});
		if (started) onclose();
	}
</script>

<Dialog title={titles[step]} description={descriptions[step]} wide onclose={() => !busy && onclose()}>
	{#if step === 'check'}
		{#if checks}
			<ul class="flex flex-col gap-2.5">
				{#each checks as item (item.id)}
					<li class="flex items-start gap-3 text-[13px] leading-relaxed">
						<span class="mt-0.5 flex-none">
							{#if item.passed}
								<CircleCheck size={16} class="text-[var(--success)]" />
							{:else}
								<CircleAlert size={16} class="text-[var(--danger)]" />
							{/if}
						</span>
						<span class={item.passed ? 'text-[var(--text-soft)]' : 'text-[var(--text)]'}>{item.sentence}</span>
					</li>
				{/each}
			</ul>
			{#if advice && !blocked}
				<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">{advice}</p>
			{/if}
		{:else if !error}
			<p class="text-[13px] text-[var(--text-muted)]">{t('ui-encryption-checking')}</p>
		{/if}
	{:else if step === 'key'}
		<RecoveryKey {key} onsave={() => onsave(key)} onprint={() => onprint(key)} />
		<Checkbox label={t('ui-recovery-key-kept')} checked={kept} onchange={(checked) => (kept = checked)}>{t('ui-recovery-key-kept')}</Checkbox>
	{:else if step === 'unlock'}
		{@render unlock(submitUnlock)}
	{:else}
		<ol class="flex flex-col gap-2.5">
			{#each summary as sentence, index (sentence)}
				<li class="flex gap-3 text-[13px] leading-relaxed text-[var(--text-soft)]">
					<span class="w-4 flex-none text-right text-[var(--text-muted)] tabular-nums">{index + 1}</span>
					<span>{sentence}</span>
				</li>
			{/each}
		</ol>
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		{#if step === 'check'}
			<button type="button" class="button" disabled={busy} onclick={onclose}>{blocked ? t('ui-dialog-close') : t('ui-dialog-cancel')}</button>
			{#if !blocked}
				<button type="button" class="button primary" disabled={busy || !checks} onclick={next}>{t('ui-dialog-continue')}</button>
			{/if}
		{:else}
			<button type="button" class="button" disabled={busy} onclick={back}>{t('ui-dialog-back')}</button>
			{#if step === 'summary'}
				<button type="button" class="button {danger ? 'danger' : 'primary'}" disabled={busy} onclick={encrypt}>{busy ? finishing : finish}</button>
			{:else}
				<button type="button" class="button primary" disabled={(step === 'key' && !kept) || (step === 'unlock' && !unlockReady)} onclick={next}>{t('ui-dialog-continue')}</button>
			{/if}
		{/if}
	{/snippet}
</Dialog>
