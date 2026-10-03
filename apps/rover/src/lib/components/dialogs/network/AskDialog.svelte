<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { Checkbox, Dialog, PasswordField, Segmented, TextField } from '@luft/ui';
	import * as api from '#lib/api.js';
	import type { NetworkAsk } from '#lib/types/index.js';

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

	function reply(answer: Partial<Parameters<typeof api.answerNetwork>[0]>) {
		void api.answerNetwork({ id: ask.id, cancelled: false, anonymous: false, remember: false, ...answer });
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
	<Dialog title="Sign in" description={lines.length > 1 ? lines.slice(1).join(' ') : lines[0]} onclose={cancel}>
		{#if ask.anonymous}
			<Segmented
				label="Sign in as"
				options={[
					{ value: 'user', label: 'Registered user' },
					{ value: 'guest', label: 'Guest' }
				]}
				value={guest}
				onchange={(value) => (guest = value)}
			/>
		{/if}
		{#if guest === 'user'}
			{#if ask.needsUser}
				<TextField bind:this={userField} label="Username" showLabel bind:value={user} autocomplete="username" />
			{/if}
			{#if ask.needsDomain}
				<TextField label="Domain" showLabel bind:value={domain} />
			{/if}
			{#if ask.needsPassword}
				<PasswordField bind:this={passwordField} label="Password" showLabel bind:value={password} autocomplete="current-password" onkeydown={(event) => event.key === 'Enter' && signIn()} />
			{/if}
			{#if ask.saving}
				<Checkbox label="Remember password" checked={remember} onchange={(value) => (remember = value)}>Remember password</Checkbox>
			{/if}
		{/if}
		{#snippet actions()}
			<button class="button" type="button" onclick={cancel}>Cancel</button>
			<button class="button primary" type="button" onclick={signIn}>Connect</button>
		{/snippet}
	</Dialog>
{:else}
	<Dialog title={lines[0] ?? 'Connect to server'} description={lines.slice(1).join(' ')} onclose={cancel}>
		{#snippet actions()}
			{#each ask.choices.toReversed() as choice, index (choice)}
				{@const value = ask.choices.length - 1 - index}
				<button class={['button', value === 0 && 'primary']} type="button" onclick={() => reply({ choice: value })}>{choice}</button>
			{/each}
		{/snippet}
	</Dialog>
{/if}
