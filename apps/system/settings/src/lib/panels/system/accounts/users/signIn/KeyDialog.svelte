<script lang="ts">
	import { t } from '@luft/i18n';
	import SecurityKey from '@luft/symbols/icons/security-key';
	import { onDestroy } from 'svelte';
	import { Dialog, PasswordField, Spinner } from '@luft/ui';
	import { commands, events, type FoundSecurityKey } from '#lib/bindings.js';
	import { attempt, WAIT_FOR_PERMISSION } from './refusals';

	interface Props {
		onclose: () => void;
	}

	const LOOK_EVERY = 1000;
	const SHORTEST_PIN = 4;

	let { onclose }: Props = $props();

	let key = $state<FoundSecurityKey | null>(null);
	let pin = $state('');
	let confirmation = $state('');
	let touch = $state(0);
	let busy = $state(false);
	let done = $state(false);
	let problem = $state('');
	let field = $state<PasswordField>();

	$effect(() => field?.focus());

	let choosing = $derived(!!key && !key.hasPin && !key.checksFingerprints);
	let mismatch = $derived(choosing && confirmation.length >= pin.length && confirmation !== pin ? t('settings-users-keys-pin-mismatch') : '');
	let ready = $derived(!busy && !!key && (key.checksFingerprints && !key.hasPin ? true : pin.length >= SHORTEST_PIN && (!choosing || confirmation === pin)));

	async function look() {
		if (key || done) return;
		const found = await commands.signInFindKey().catch(() => null);
		if (found?.found) key = found;
	}

	const looking = setInterval(() => void look(), LOOK_EVERY);
	void look();
	onDestroy(events.signInTouch((step) => (touch = step)));
	onDestroy(() => clearInterval(looking));

	async function add() {
		if (!ready) return;
		busy = true;
		problem = '';
		touch = 0;
		problem = (await attempt(() => commands.signInAddKey({ pin }, { timeoutMs: WAIT_FOR_PERMISSION }))) ?? '';
		done = !problem;
		busy = false;
		pin = '';
		confirmation = '';
	}

	function enter(event: KeyboardEvent) {
		if (event.key === 'Enter') void add();
	}
</script>

<Dialog title={t('settings-users-keys-add-key')} onclose={onclose}>
	<div class="flex items-center gap-3 text-[13px] text-[var(--text-soft)]">
		<SecurityKey size={20} />
		<span>
			{#if done}
				{t('settings-users-keys-key-added')}
			{:else if busy}
				{touch === 2 ? t('settings-users-keys-touch-again') : touch === 1 ? t('settings-users-keys-touch') : t('settings-users-keys-waiting')}
			{:else if !key}
				{t('settings-users-keys-plug-in')}
			{:else if choosing}
				{t('settings-users-keys-choose-pin')}
			{:else if key.hasPin}
				{t('settings-users-keys-enter-pin')}
			{:else}
				{t('settings-users-keys-ready')}
			{/if}
		</span>
	</div>
	{#if key && !done && !busy && (key.hasPin || choosing)}
		<PasswordField bind:this={field} label={t('settings-users-keys-pin')} showLabel bind:value={pin} live onkeydown={enter} />
		{#if choosing}
			<PasswordField label={t('settings-users-keys-pin-confirm')} showLabel bind:value={confirmation} error={mismatch} live onkeydown={enter} />
		{/if}
	{/if}
	{#if problem}
		<p class="text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		{#if done}
			<button type="button" class="button primary" onclick={onclose}>{t('settings-users-done')}</button>
		{:else}
			<button type="button" class="button" onclick={onclose}>{t('settings-users-cancel')}</button>
			<button type="button" class="button primary" disabled={!ready} onclick={add}>{#if busy}<Spinner />{/if}{t('settings-users-keys-add')}</button>
		{/if}
	{/snippet}
</Dialog>
