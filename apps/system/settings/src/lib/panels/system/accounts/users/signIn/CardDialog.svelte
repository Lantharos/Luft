<script lang="ts">
	import { t } from '@luft/i18n';
	import IdCard from '@luft/symbols/icons/id-card';
	import { onDestroy } from 'svelte';
	import { Dialog, PasswordField, Spinner } from '@luft/ui';
	import { commands, type FoundSmartCard } from '#lib/bindings.js';
	import { attempt, WAIT_FOR_PERMISSION } from './refusals';

	interface Props {
		onclose: () => void;
	}

	const LOOK_EVERY = 1000;

	let { onclose }: Props = $props();

	let card = $state<FoundSmartCard | null>(null);
	let pin = $state('');
	let busy = $state(false);
	let done = $state(false);
	let problem = $state('');
	let field = $state<PasswordField>();

	$effect(() => field?.focus());

	let ready = $derived(!busy && !!card && pin.length > 0);

	async function look() {
		if (card || done) return;
		const found = await commands.signInFindCard().catch(() => null);
		if (found?.found) card = found;
	}

	const looking = setInterval(() => void look(), LOOK_EVERY);
	void look();
	onDestroy(() => clearInterval(looking));

	async function add() {
		if (!ready) return;
		busy = true;
		problem = (await attempt(() => commands.signInAddCard({ pin }, { timeoutMs: WAIT_FOR_PERMISSION }))) ?? '';
		done = !problem;
		busy = false;
		pin = '';
	}
</script>

<Dialog title={t('settings-users-keys-add-card')} onclose={onclose}>
	<div class="flex items-center gap-3 text-[13px] text-[var(--text-soft)]">
		<IdCard size={20} />
		<span>
			{#if done}
				{t('settings-users-keys-card-added')}
			{:else if card}
				{card.name ? t('settings-users-keys-card-pin-named', { name: card.name }) : t('settings-users-keys-card-pin')}
			{:else}
				{t('settings-users-keys-insert-card')}
			{/if}
		</span>
	</div>
	{#if card && !done}
		<PasswordField bind:this={field} label={t('settings-users-keys-pin')} showLabel bind:value={pin} disabled={busy} live onkeydown={(event) => event.key === 'Enter' && void add()} />
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
