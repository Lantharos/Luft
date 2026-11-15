<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Checkbox, Dialog, PasswordField, Segmented, TextField } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { NetworkAsk } from '#lib/bindings.js';

	interface Props {
		ask: Exclude<NetworkAsk, { kind: 'done' }>;
		onclose: () => void;
	}

	let { ask, onclose }: Props = $props();

	const initial = untrack(() => ask);
	let user = $state(initial.kind === 'password' ? initial.user : '');
	let domain = $state(initial.kind === 'password' ? initial.domain : '');
	let password = $state('');
	let guest = $state<'user' | 'guest'>('user');
	let remember = $state(false);

	let lines = $derived(ask.message.split('\n').filter(Boolean));
	let userField = $state<{ focus: () => void }>();
	let passwordField = $state<{ focus: () => void }>();

	$effect(() => {
		void tick().then(() => (initial.kind === 'password' && initial.needsUser && !user ? userField : passwordField)?.focus());
	});

	function reply(answer: Partial<Parameters<typeof commands.networkAnswer>[0]>) {
		void commands.networkAnswer({ id: ask.id, cancelled: false, anonymous: false, remember: false, ...answer });
		onclose();
	}

	function cancel() {
		reply({ cancelled: true });
	}

	function signIn() {
		if (guest === 'guest') return reply({ anonymous: true });
		reply({ user, domain, password, remember });
	}
</script>

{#if ask.kind === 'password'}
	<Dialog title={t('rover-ask-title')} description={lines.length > 1 ? lines.slice(1).join(' ') : lines[0]} onclose={cancel}>
		{#if ask.anonymous}
			<Segmented
				label={t('rover-ask-as')}
				options={[
					{ value: 'user', label: t('rover-ask-as-user') },
					{ value: 'guest', label: t('rover-ask-as-guest') }
				]}
				value={guest}
				onchange={(value) => (guest = value)}
			/>
		{/if}
		{#if guest === 'user'}
			{#if ask.needsUser}
				<TextField bind:this={userField} label={t('rover-ask-username')} showLabel bind:value={user} autocomplete="username" />
			{/if}
			{#if ask.needsDomain}
				<TextField label={t('rover-ask-domain')} showLabel bind:value={domain} />
			{/if}
			{#if ask.needsPassword}
				<PasswordField bind:this={passwordField} label={t('rover-ask-password')} showLabel bind:value={password} autocomplete="current-password" onkeydown={(event) => event.key === 'Enter' && signIn()} />
			{/if}
			{#if ask.saving}
				<Checkbox label={t('rover-ask-remember')} checked={remember} onchange={(value) => (remember = value)}>{t('rover-ask-remember')}</Checkbox>
			{/if}
		{/if}
		{#snippet actions()}
			<button class="button" type="button" onclick={cancel}>{t('rover-cancel')}</button>
			<button class="button primary" type="button" onclick={signIn}>{t('rover-connect')}</button>
		{/snippet}
	</Dialog>
{:else}
	<Dialog title={lines[0] ?? t('rover-connect-title')}
 description={lines.slice(1).join(' ')} onclose={cancel}>
		{#snippet actions()}
			{#each ask.choices.toReversed() as choice, index (choice)}
				{@const value = ask.choices.length - 1 - index}
				<button class={['button', value === 0 && 'primary']} type="button" onclick={() => reply({ choice: value })}>{choice}</button>
			{/each}
		{/snippet}
	</Dialog>
{/if}
