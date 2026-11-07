<script lang="ts">
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { t } from '@luft/i18n';
	import { errorText, Row, Section, Spinner } from '@luft/ui';
	import type { Trust } from '#lib/bindings.js';
	import SubPage from '#lib/components/SubPage.svelte';
	import { cancelSigningKey, enrollSigningKey, restart } from '../api';
	import { withoutKeySentence } from './describe';
	import ShimSteps from './ShimSteps.svelte';

	let { trust, onclose }: { trust: Trust; onclose: () => void } = $props();

	let code = $state('');
	let busy = $state(false);
	let fetching = $state(false);
	let error = $state('');

	let key = $derived(trust.signingKey);
	let on = $derived(trust.secureBoot === 'on');
	let ready = $derived(key.state === 'enrolled');
	let pending = $derived(key.state === 'pending');

	let status = $derived.by(() => {
		if (!on) return { title: t('settings-secure-boot-off'), description: t('settings-secure-boot-off-description') };
		if (ready) return { title: t('settings-secure-boot-ready'), description: t('settings-security-secure-boot-description') };
		if (pending)
			return {
				title: t('settings-secure-boot-pending-title'),
				description: t(key.missed ? 'settings-secure-boot-missed-description' : 'settings-secure-boot-pending-description')
			};
		return {
			title: t('settings-secure-boot-none-title'),
			description: key.available ? t(key.missed ? 'settings-secure-boot-gave-up-description' : 'settings-secure-boot-none-description') : undefined
		};
	});

	async function attempt(action: () => Promise<unknown>) {
		busy = true;
		error = '';
		try {
			await action();
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}

	async function showCode() {
		fetching = true;
		await attempt(async () => (code = await enrollSigningKey()));
		fetching = false;
	}
	const cancel = () => attempt(async () => {
		await cancelSigningKey();
		code = '';
	});
</script>

{#snippet failure()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

<SubPage title={t('settings-security-secure-boot')} {onclose}>
	<Section>
		<Row title={status.title} description={status.description} icon={ready ? ShieldCheck : ShieldAlert} below={error ? failure : undefined}>
			{#if on && pending}
				<button type="button" class="button" disabled={busy} onclick={cancel}>{t('settings-protection-cancel')}</button>
				<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>{t('settings-security-restart-now')}</button>
			{:else if on && !ready && key.available}
				<button type="button" class="button primary" disabled={busy} onclick={showCode}>
					{#if fetching}<Spinner />{/if}{t(key.missed ? 'settings-security-try-again' : 'settings-protection-set-up')}
				</button>
			{/if}
		</Row>
		{#if on && !ready && trust.startup.withoutKey}
			<p class="px-4 pb-4 text-[12.5px] leading-relaxed text-[var(--text-muted)]">{withoutKeySentence(trust.disk)}</p>
		{/if}
	</Section>

	{#if on && (pending || code)}
		<Section title={t('settings-secure-boot-steps')} description={t('settings-secure-boot-steps-description')}>
			<div class="flex flex-col gap-4 p-4">
				{#if code}
					<ShimSteps {code} />
				{:else}
					<div class="flex items-center justify-between gap-4">
						<p class="text-[13px] text-[var(--text-soft)]">{t('settings-secure-boot-code-hidden')}</p>
						<button type="button" class="button" disabled={busy} onclick={showCode}>{#if fetching}<Spinner />{/if}{t('settings-secure-boot-show-code')}</button>
					</div>
					<ShimSteps />
				{/if}
				<p class="text-[12.5px] leading-relaxed text-[var(--text-muted)]">{t('settings-secure-boot-missed-note')}</p>
			</div>
		</Section>
	{/if}
</SubPage>
