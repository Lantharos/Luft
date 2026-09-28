<script lang="ts">
	import { PasswordField, Row, Select, TextField } from '@luft/ui';
	import { chooseCertificate, type EapMethod, type Enterprise } from './profile';
	import type { Errors } from './validate';

	interface Props {
		enterprise: Enterprise;
		password: string;
		errors: Errors;
		saved?: boolean;
		onreveal?: () => Promise<void>;
	}

	type Authority = 'system' | 'none' | 'file' | 'another';

	const METHODS: { value: EapMethod; label: string }[] = [
		{ value: 'peap', label: 'Protected EAP (PEAP)' },
		{ value: 'ttls', label: 'Tunneled TLS (TTLS)' },
		{ value: 'tls', label: 'Certificate (TLS)' }
	];

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

	let tls = $derived(enterprise.method === 'tls');
	let authority = $derived<Authority>(enterprise.caCertificate ? 'file' : enterprise.systemCertificates ? 'system' : 'none');
	let authorities = $derived<{ value: Authority; label: string }[]>([
		{ value: 'system', label: 'Use system certificates' },
		{ value: 'file', label: enterprise.caCertificate ? fileName(enterprise.caCertificate) : 'Choose a file…' },
		...(enterprise.caCertificate ? [{ value: 'another' as const, label: 'Choose another file…' }] : []),
		{ value: 'none', label: 'Don’t check' }
	]);

	function fileName(path: string) {
		return path.split('/').pop() ?? path;
	}

	function chooseMethod(method: EapMethod) {
		enterprise.method = method;
		if (method !== 'tls' && !INNER[method].some((option) => option.value === enterprise.inner)) enterprise.inner = INNER[method][0].value;
	}

	async function chooseAuthority(choice: Authority) {
		if (choice === 'file' || choice === 'another') {
			const path = await chooseCertificate('authority');
			if (!path) return;
			enterprise.caCertificate = path;
		} else {
			enterprise.caCertificate = null;
			enterprise.systemCertificates = choice === 'system';
		}
	}

	async function chooseClient() {
		enterprise.clientCertificate = (await chooseCertificate('client')) ?? enterprise.clientCertificate;
	}

	async function chooseKey() {
		enterprise.privateKey = (await chooseCertificate('key')) ?? enterprise.privateKey;
	}
</script>

{#snippet file(path: string | null, error: string | undefined, choose: () => void)}
	<div class="flex max-w-[260px] flex-col items-end gap-1.5">
		<button type="button" class="button max-w-full" onclick={choose}>
			<span class="truncate">{path ? fileName(path) : 'Choose…'}</span>
		</button>
		{#if error && !path}
			<p class="px-3.5 text-[12.5px] text-[var(--danger)]">{error}</p>
		{/if}
	</div>
{/snippet}

<Row title="Authentication">
	<Select label="Authentication" options={METHODS} value={enterprise.method} onchange={chooseMethod} />
</Row>
{#if enterprise.method !== 'tls'}
	<Row title="Inner authentication">
		<Select label="Inner authentication" options={INNER[enterprise.method]} value={enterprise.inner} onchange={(inner) => (enterprise.inner = inner)} />
	</Row>
{/if}
<Row title="Username">
	<div class="w-[260px]">
		<TextField label="Username" bind:value={enterprise.identity} error={errors['enterprise.identity']} />
	</div>
</Row>
{#if tls}
	<Row title="Your certificate">
		{@render file(enterprise.clientCertificate, errors['enterprise.clientCertificate'], chooseClient)}
	</Row>
	<Row title="Private key">
		{@render file(enterprise.privateKey, errors['enterprise.privateKey'], chooseKey)}
	</Row>
{/if}
<Row title={tls ? 'Private key password' : 'Password'}>
	<div class="w-[260px]">
		<PasswordField
			label={tls ? 'Private key password' : 'Password'}
			bind:value={password}
			placeholder={saved ? 'Saved password' : tls ? 'If the key has one' : 'Password'}
			error={errors.password}
			onreveal={saved ? onreveal : undefined}
		/>
	</div>
</Row>
<Row title="Anonymous identity" description="Sent before the secure connection is set up. Leave empty unless your network asks for it.">
	<div class="w-[260px]">
		<TextField label="Anonymous identity" bind:value={enterprise.anonymousIdentity} placeholder="Optional" />
	</div>
</Row>
<Row title="CA certificate" description="Confirms you’re connecting to the real network">
	<Select label="CA certificate" options={authorities} value={authority} onchange={chooseAuthority} />
</Row>
<Row title="Server domain" description="Only connect to servers in this domain">
	<div class="w-[260px]">
		<TextField label="Server domain" bind:value={enterprise.domain} placeholder="example.com" error={errors['enterprise.domain']} />
	</div>
</Row>
