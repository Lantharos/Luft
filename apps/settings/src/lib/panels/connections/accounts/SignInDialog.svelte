<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { Choice, Dialog, PasswordField, TextField } from '@luft/ui';
	import { cancel, signIn, signInAgain, type Account, type Credentials, type Step } from './api';
	import { PROVIDERS, provider as providerOf, type ProviderInfo } from './providers';
	import SignInFlow from './SignInFlow.svelte';

	interface Props {
		again?: Account;
		onclose: () => void;
	}

	let { again, onclose }: Props = $props();

	type Stage = 'choose' | 'details' | 'flow';

	const initial = untrack(() => again);

	let chosen = $state<ProviderInfo | null>(initial ? providerOf(initial.provider) : null);
	let stage = $state<Stage>(initial ? 'flow' : 'choose');
	let server = $state(initial?.server ?? '');
	let user = $state(initial?.user ?? '');
	let password = $state('');
	let appPassword = $state(false);
	let session = $state('');
	let step = $state<Step>({ step: 'working' });
	let code = $state('');
	let error = $state('');
	let flow = $state<SignInFlow>();

	let needsPassword = $derived(chosen?.signIn === 'password' || chosen?.signIn === 'apple' || (chosen?.signIn === 'nextcloud' && appPassword));
	let canCode = $derived(step.step === 'code' && code.replace(/\D/g, '').length === 6);
	let title = $derived(again ? `Sign in to ${again.name} again` : chosen ? chosen.name : 'Add an account');
	let description = $derived(again?.standing.kind === 'signInAgain' && stage !== 'flow' ? again.standing.reason : undefined);

	$effect(() => {
		if (step.step === 'done') onclose();
	});

	onDestroy(() => {
		if (session && !['done', 'failed'].includes(step.step)) void cancel(session);
	});

	if (initial && providerOf(initial.provider).signIn === 'password') stage = 'details';
	else if (initial) void start();

	function choose(info: ProviderInfo) {
		chosen = info;
		error = '';
		stage = 'details';
	}

	function credentials(): Credentials {
		switch (chosen!.signIn) {
			case 'apple':
				return { user: user.trim(), password };
			case 'nextcloud':
				return appPassword ? { server: server.trim(), user: user.trim(), password } : { server: server.trim() };
			case 'password':
				return { server: server.trim(), user: user.trim(), password };
			case 'browser':
				return {};
		}
	}

	function missing() {
		const kind = chosen!.signIn;
		if (!again && (kind === 'nextcloud' || kind === 'password') && !server.trim()) return 'Enter the server address';
		if (!again && needsPassword && !user.trim()) return kind === 'apple' ? 'Enter your Apple Account email' : 'Enter the user name';
		if (needsPassword && !password) return 'Enter the password';
		return '';
	}

	async function start() {
		error = stage === 'details' ? missing() : '';
		if (error) return;
		step = { step: 'working' };
		stage = 'flow';
		try {
			session = again ? await signInAgain(again.id, credentials()) : await signIn(chosen!.id, credentials());
		} catch (reason) {
			step = { step: 'failed', message: String(reason) };
		}
	}

	function retry() {
		error = '';
		password = '';
		stage = chosen!.signIn === 'browser' ? 'flow' : 'details';
		if (stage === 'flow') void start();
	}

	function back() {
		if (session && !['done', 'failed'].includes(step.step)) void cancel(session);
		session = '';
		error = '';
		stage = 'details';
	}

	function submit(event: KeyboardEvent) {
		if (event.key === 'Enter' && stage === 'details') void start();
	}
</script>

<Dialog {title} {description} onclose={onclose}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="flex flex-col gap-3" onkeydown={submit}>
		{#if stage === 'choose'}
			<div class="-mx-2 flex flex-col">
				{#each PROVIDERS as info (info.id)}
					<Choice icon={info.icon} title={info.name} description={info.description} onclick={() => choose(info)} />
				{/each}
			</div>
		{:else if stage === 'details' && chosen}
			{#if chosen.signIn === 'browser'}
				<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">
					Your browser opens so you can sign in with {chosen.id === 'onedrive' ? 'Microsoft' : 'Dropbox'}. Luft never sees your password.
				</p>
			{:else if chosen.signIn === 'apple'}
				{#if again}
					<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">Enter the password for {again.user}.</p>
				{:else}
					<TextField bind:value={user} label="Apple Account" showLabel placeholder="you@icloud.com" inputmode="email" autocomplete="username" />
				{/if}
				<PasswordField bind:value={password} label="Password" showLabel autocomplete="current-password" />
				<p class="text-[12.5px] leading-relaxed text-[var(--text-muted)]">
					Use your Apple Account password; app-specific passwords don’t work here. Apple then shows a code on your iPhone, iPad or Mac.
				</p>
			{:else}
				{#if !again}
					<TextField
						bind:value={server}
						label="Server"
						showLabel
						placeholder={chosen.signIn === 'nextcloud' ? 'cloud.example.com' : 'https://dav.example.com/files'}
						type="url"
						inputmode="url"
					/>
				{/if}
				{#if needsPassword}
					{#if !again}
						<TextField bind:value={user} label="User name" showLabel autocomplete="username" />
					{/if}
					<PasswordField bind:value={password} label={chosen.signIn === 'nextcloud' ? 'App password' : 'Password'} showLabel autocomplete="current-password" />
				{:else}
					<p class="text-[13px] leading-relaxed text-[var(--text-muted)]">Your browser opens so you can sign in to your server and allow Luft in.</p>
					<button type="button" class="plain-button self-start" onclick={() => (appPassword = true)}>Use an app password instead</button>
				{/if}
			{/if}
		{:else if stage === 'flow'}
			<SignInFlow bind:this={flow} {session} providerName={chosen!.name} bind:step bind:code />
		{/if}
		{#if error}
			<p class="px-1 text-[12.5px] leading-relaxed text-[var(--danger)]">{error}</p>
		{/if}
	</div>
	{#snippet actions()}
		{#if stage === 'choose'}
			<button type="button" class="button" onclick={onclose}>Cancel</button>
		{:else if stage === 'details'}
			<button type="button" class="button" onclick={again ? onclose : () => ((stage = 'choose'), (appPassword = false))}>{again ? 'Cancel' : 'Back'}</button>
			<button type="button" class="button primary" onclick={start}>
				{chosen?.signIn === 'browser' || (chosen?.signIn === 'nextcloud' && !appPassword) ? 'Continue in browser' : 'Sign in'}
			</button>
		{:else if step.step === 'failed'}
			<button type="button" class="button" onclick={again ? onclose : back}>{again ? 'Cancel' : 'Back'}</button>
			<button type="button" class="button primary" onclick={retry}>Try again</button>
		{:else}
			<button type="button" class="button" onclick={again ? onclose : back}>Cancel</button>
			{#if step.step === 'code'}
				<button type="button" class="button primary" disabled={!canCode} onclick={() => flow?.submitCode()}>Continue</button>
			{/if}
		{/if}
	{/snippet}
</Dialog>
