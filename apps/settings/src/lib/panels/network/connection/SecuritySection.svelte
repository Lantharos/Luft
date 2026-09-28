<script lang="ts">
	import { PasswordField, Row, Section, Select } from '@luft/ui';
	import { needsPassword, type Security } from '../api';
	import { securityLabel } from '../describe';
	import EnterpriseFields from './EnterpriseFields.svelte';
	import { newEnterprise, type Wireless } from './profile';
	import type { Errors } from './validate';

	interface Props {
		wireless: Wireless;
		password: string;
		errors: Errors;
		saved: boolean;
		onreveal: () => Promise<void>;
	}

	const CHOICES: Security[] = ['open', 'psk', 'sae', 'enterprise'];

	let { wireless = $bindable(), password = $bindable(), errors, saved, onreveal }: Props = $props();

	let options = $derived(
		(CHOICES.includes(wireless.security) ? CHOICES : [...CHOICES, wireless.security]).map((value) => ({ value, label: securityLabel(value) }))
	);

	function choose(security: Security) {
		wireless.security = security;
		if (security === 'enterprise') wireless.enterprise ??= newEnterprise();
	}
</script>

<Section title="Security">
	<Row title="Security type">
		<Select label="Security type" {options} value={wireless.security} onchange={choose} />
	</Row>
	{#if needsPassword(wireless.security)}
		<Row title="Password">
			<div class="w-[260px]">
				<PasswordField label="Password" bind:value={password} placeholder={saved ? 'Saved password' : 'Password'} error={errors.password} onreveal={saved ? onreveal : undefined} />
			</div>
		</Row>
	{:else if wireless.security === 'enterprise' && wireless.enterprise}
		<EnterpriseFields bind:enterprise={wireless.enterprise} bind:password {errors} {saved} {onreveal} />
	{/if}
</Section>
