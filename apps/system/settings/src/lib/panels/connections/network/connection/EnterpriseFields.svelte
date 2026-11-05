<script lang="ts">
	import { t } from '@luft/i18n';
	import { basename, PasswordField, Row, Select, TextField } from '@luft/ui';
	import { waitForPerson, type EapMethod, type Enterprise } from '@luft/network';
	import { commands } from '#lib/bindings.js';
	import type { Errors } from './validate';

	interface Props {
		enterprise: Enterprise;
		password: string;
		errors: Errors;
		saved?: boolean;
		onreveal?: () => Promise<void>;
	}

	type Authority = 'system' | 'none' | 'file' | 'another';

	const INNER: Record<Exclude<EapMethod, 'tls'>, { value: string; label: string }[]> = {
		peap: [
			{ value: 'mschapv2', label: 'MSCHAPv2' },
			{ value: 'gtc', label: 'GTC' },
			{ value: 'md5', label: 'MD5' }
		],
		ttls: [
			{ value: 'pap', label: 'PAP' },
			{ value: 'mschap', label: 'MSCHAP' },
			{ value: 'mschapv2', label: 'MSCHAPv2' },
			{ value: 'chap', label: 'CHAP' }
		]
	};

	let { enterprise = $bindable(), password = $bindable(), errors, saved = false, onreveal }: Props = $props();

	let methods = $derived<{ value: EapMethod; label: string }[]>([
		{ value: 'peap', label: t('settings-network-eap-peap') },
		{ value: 'ttls', label: t('settings-network-eap-ttls') },
		{ value: 'tls', label: t('settings-network-eap-tls') }
	]);
	let tls = $derived(enterprise.method === 'tls');
	let authority = $derived<Authority>(enterprise.caCertificate ? 'file' : enterprise.systemCertificates ? 'system' : 'none');
	let authorities = $derived<{ value: Authority; label: string }[]>([
		{ value: 'system', label: t('settings-network-ca-system') },
		{ value: 'file', label: enterprise.caCertificate ? basename(enterprise.caCertificate) : t('settings-network-ca-file') },
		...(enterprise.caCertificate ? [{ value: 'another' as const, label: t('settings-network-ca-another-file') }] : []),
		{ value: 'none', label: t('settings-network-ca-none') }
	]);

	function chooseMethod(method: EapMethod) {
		enterprise.method = method;
		if (method !== 'tls' && !INNER[method].some((option) => option.value === enterprise.inner)) enterprise.inner = INNER[method][0].value;
	}

	async function chooseAuthority(choice: Authority) {
		if (choice === 'file' || choice === 'another') {
			const path = await commands.networkChooseCertificate({ purpose: 'authority' }, waitForPerson);
			if (!path) return;
			enterprise.caCertificate = path;
		} else {
			enterprise.caCertificate = null;
			enterprise.systemCertificates = choice === 'system';
		}
	}

	async function chooseClient() {
		enterprise.clientCertificate = (await commands.networkChooseCertificate({ purpose: 'client' }, waitForPerson)) ?? enterprise.clientCertificate;
	}

	async function chooseKey() {
		enterprise.privateKey = (await commands.networkChooseCertificate({ purpose: 'key' }, waitForPerson)) ?? enterprise.privateKey;
	}
</script>

{#snippet file(path: string | null, error: string | undefined, choose: () => void)}
	<div class="flex max-w-[260px] flex-col items-end gap-1.5">
		<button type="button" class="button max-w-full" onclick={choose}>
			<span class="truncate">{path ? basename(path) : t('settings-network-choose-file')}</span>
		</button>
		{#if error && !path}
			<p class="px-3.5 text-[12.5px] text-[var(--danger)]">{error}</p>
		{/if}
	</div>
{/snippet}

<Row title={t('settings-network-eap')}>
	<Select label={t('settings-network-eap')} options={methods} value={enterprise.method} onchange={chooseMethod} />
</Row>
{#if enterprise.method !== 'tls'}
	<Row title={t('settings-network-eap-inner')}>
		<Select label={t('settings-network-eap-inner')} options={INNER[enterprise.method]} value={enterprise.inner} onchange={(inner) => (enterprise.inner = inner)} />
	</Row>
{/if}
<Row title={t('settings-network-username')}>
	<div class="w-[260px]">
		<TextField label={t('settings-network-username')} bind:value={enterprise.identity} error={errors['enterprise.identity']} />
	</div>
</Row>
{#if tls}
	<Row title={t('settings-network-client-certificate')}>
		{@render file(enterprise.clientCertificate, errors['enterprise.clientCertificate'], chooseClient)}
	</Row>
	<Row title={t('settings-network-private-key')}>
		{@render file(enterprise.privateKey, errors['enterprise.privateKey'], chooseKey)}
	</Row>
{/if}
<Row title={tls ? t('settings-network-private-key-password') : t('settings-network-password')}>
	<div class="w-[260px]">
		<PasswordField
			label={tls ? t('settings-network-private-key-password') : t('settings-network-password')}
			bind:value={password}
			placeholder={saved ? t('settings-network-password-saved') : tls ? t('settings-network-private-key-password.placeholder') : t('settings-network-password')}
			error={errors.password}
			onreveal={saved ? onreveal : undefined}
		/>
	</div>
</Row>
<Row title={t('settings-network-anonymous-identity')} description={t('settings-network-anonymous-identity.description')}>
	<div class="w-[260px]">
		<TextField label={t('settings-network-anonymous-identity')} bind:value={enterprise.anonymousIdentity} placeholder={t('settings-network-optional')} />
	</div>
</Row>
<Row title={t('settings-network-ca')} description={t('settings-network-ca.description')}>
	<Select label={t('settings-network-ca')} options={authorities} value={authority} onchange={chooseAuthority} />
</Row>
<Row title={t('settings-network-server-domain')} description={t('settings-network-server-domain.description')}>
	<div class="w-[260px]">
		<TextField label={t('settings-network-server-domain')} bind:value={enterprise.domain} placeholder="example.com" error={errors['enterprise.domain']} />
	</div>
</Row>
