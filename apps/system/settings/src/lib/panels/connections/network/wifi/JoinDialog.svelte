<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Dialog, PasswordField, Segmented, TextField } from '@luft/ui';
	import EnterpriseFields from '../connection/EnterpriseFields.svelte';
	import { newEnterprise } from '../connection/profile';
	import { checkEnterprise, minimumPassword, type Errors } from '../connection/validate';
	import { needsPassword, type Security } from '@luft/network';
	import { commands, events } from '#lib/bindings.js';

	interface Props {
		device: string;
		ssid?: string;
		security?: Security;
		replace?: boolean;
		problem?: string;
		onclose: () => void;
	}

	let { device, ssid, security = 'psk', replace = false, problem = '', onclose }: Props = $props();

	const initial = untrack(() => ({ name: ssid ?? '', security, problem }));

	let hidden = $derived(ssid === undefined);
	let name = $state(initial.name);
	let choice = $state<Security>(initial.security);
	let password = $state('');
	let enterprise = $state(newEnterprise());
	let busy = $state(false);
	let error = $state(initial.problem);

	let hiddenSecurity = $derived<{ value: Security; label: string }[]>([
		{ value: 'open', label: t('settings-network-security-open') },
		{ value: 'psk', label: 'WPA2' },
		{ value: 'sae', label: 'WPA3' },
		{ value: 'enterprise', label: t('settings-network-security-enterprise') }
	]);
	let corporate = $derived(choice === 'enterprise');
	let errors = $derived(check());
	let ready = $derived(!busy && name.trim().length > 0 && Object.keys(errors).length === 0);

	function check() {
		const errors: Errors = {};
		if (corporate) {
			checkEnterprise(enterprise, errors);
			if (enterprise.method !== 'tls' && !password) errors.password = t('settings-network-error-password');
		} else if (needsPassword(choice) && password.length < minimumPassword(choice)) {
			errors.password = t('settings-network-error-password-length', { count: minimumPassword(choice) });
		}
		return errors;
	}

	async function submit() {
		if (!ready) return;
		busy = true;
		error = '';
		try {
			if (replace) await commands.networkForget({ ssid: name });
			await commands.networkJoin({
				device,
				ssid: name.trim(),
				security: choice,
				password: needsPassword(choice) || corporate ? password : '',
				hidden,
				enterprise: corporate ? $state.snapshot(enterprise) : undefined
			});
		} catch {
			error = t('settings-network-join-failed');
			busy = false;
		}
	}

	$effect(() => {
		const stopFailed = events.networkFailed((failure) => {
			if (!busy || failure.path !== device) return;
			busy = false;
			if (failure.reason !== 'password') error = t('settings-network-join-failed');
			else if (corporate) error = t('settings-network-join-sign-in-failed');
			else error = t('settings-network-join-wrong-password');
		});
		const stopChanged = events.networkChanged((network) => {
			const joined = network.wifi?.networks.some((candidate) => candidate.ssid === name.trim() && candidate.state === 'connected');
			if (busy && joined) onclose();
		});
		return () => {
			stopFailed();
			stopChanged();
		};
	});
</script>

<Dialog
	title={hidden ? t('settings-network-hidden') : t('settings-network-join', { network: ssid ?? '' })}
	description={hidden ? t('settings-network-hidden.description') : corporate ? t('settings-network-join-enterprise') : t('settings-network-join-password')}
	wide={corporate}
	{onclose}
>
	{#if hidden}
		<TextField
			label={t('settings-network-hidden-name')}
			bind:value={name}
			placeholder={t('settings-network-hidden-name')}
			onkeydown={(event) => event.key === 'Enter' && submit()}
		/>
		<div class="flex items-center justify-between gap-4">
			<span class="text-[13px] text-[var(--text-soft)]">{t('settings-network-security')}</span>
			<Segmented label={t('settings-network-security')} options={hiddenSecurity} value={choice} onchange={(value) => (choice = value)} />
		</div>
	{/if}
	{#if corporate}
		<div class="fields">
			<EnterpriseFields bind:enterprise bind:password {errors} />
		</div>
	{:else if needsPassword(choice)}
		<PasswordField
			label={t('settings-network-password')}
			bind:value={password}
			placeholder={t('settings-network-password')}
			error={errors.password}
			onkeydown={(event) => event.key === 'Enter' && submit()}
		/>
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('settings-network-cancel')}</button>
		<button type="button" class="button primary" disabled={!ready} onclick={submit}>{busy ? t('settings-network-link-connecting') : t('settings-network-connect')}</button>
	{/snippet}
</Dialog>

<style>
	.fields {
		display: flex;
		flex-direction: column;
		margin-inline: -16px;
	}

	.fields > :global(* + *) {
		box-shadow: inset 0 1px 0 var(--hairline);
	}
</style>
