<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { IconButton, Row, Section, Select, Switch, TextField } from '@luft/ui';
	import RouteRow from './RouteRow.svelte';
	import type { Family, Ip } from '@luft/network';
	import { configurable } from './profile';
	import { words, type Errors } from './validate';

	interface Props {
		family: Family;
		ip: Ip;
		errors: Errors;
	}

	const METHOD_LABELS: Record<string, string> = {
		auto: 'settings-network-automatic',
		dhcp: 'settings-network-ip-dhcp',
		manual: 'settings-network-ip-manual',
		'link-local': 'settings-network-ip-link-local',
		shared: 'settings-network-ip-shared',
		ignore: 'settings-network-ip-ignore',
		disabled: 'settings-network-ip-disabled'
	};
	const OFFERED = ['auto', 'manual', 'link-local', 'disabled'];

	let { family, ip = $bindable(), errors }: Props = $props();

	let dns = $state(untrack(() => ip.dns.join(', ')));
	let search = $state(untrack(() => ip.search.join(', ')));

	let title = $derived(family === 'ipv4' ? 'IPv4' : 'IPv6');
	let example = $derived(family === 'ipv4' ? '192.168.1.20/24' : '2001:db8::20/64');
	let automatic = $derived(ip.method === 'auto' || ip.method === 'dhcp');
	let methods = $derived((OFFERED.includes(ip.method) ? OFFERED : [...OFFERED, ip.method]).map((value) => ({ value, label: value in METHOD_LABELS ? t(METHOD_LABELS[value]) : value })));

	function addRoute() {
		ip.routes.push({ destination: '', gateway: '', metric: null });
	}
</script>

<Section title={title}>
	<Row title={t('settings-network-ip-method')}>
		<Select label={t('settings-network-ip-method.label', { family: title })} options={methods} value={ip.method} onchange={(method) => (ip.method = method)} />
	</Row>
	{#if ip.method === 'manual'}
		<Row title={t('settings-network-ip-addresses')} description={t('settings-network-ip-addresses.description', { example })}>
			{#snippet below()}
				{#each ip.addresses as _, index (index)}
					<div class="flex items-start gap-2">
						<div class="flex-1">
							<TextField label={t('settings-network-ip-address', { number: index + 1 })} bind:value={ip.addresses[index]} placeholder={example} error={errors[`${family}.address.${index}`]} />
						</div>
						<IconButton icon={X} label={t('settings-network-ip-remove-address')} onclick={() => ip.addresses.splice(index, 1)} />
					</div>
				{/each}
				{#if errors[`${family}.addresses`]}
					<p class="text-[12.5px] text-[var(--danger)]">{errors[`${family}.addresses`]}</p>
				{/if}
				<button type="button" class="button self-start" onclick={() => ip.addresses.push('')}>{t('settings-network-ip-add-address')}</button>
			{/snippet}
		</Row>
		<Row title={t('settings-network-router')}>
			<div class="w-[260px]">
				<TextField label={t('settings-network-ip-router', { family: title })} bind:value={ip.gateway} placeholder={t('settings-network-optional')} error={errors[`${family}.gateway`]} />
			</div>
		</Row>
	{/if}
	{#if configurable(ip.method)}
		{#if automatic}
			<Row title={t('settings-network-ip-automatic-dns')} description={t('settings-network-ip-automatic-dns.description')}>
				<Switch label={t('settings-network-ip-automatic-dns')} checked={ip.automaticDns} onchange={(on) => (ip.automaticDns = on)} />
			</Row>
		{/if}
		<Row
			title={t('settings-network-dns-servers')}
			description={automatic && ip.automaticDns ? t('settings-network-ip-dns-first') : t('settings-network-ip-dns-separate')}
		>
			<div class="w-[260px]">
				<TextField
					label={t('settings-network-ip-dns-servers', { family: title })}
					bind:value={() => dns, (text) => ((dns = text), (ip.dns = words(text)))}
					placeholder={automatic ? t('settings-network-optional') : ''}
					error={errors[`${family}.dns`]}
				/>
			</div>
		</Row>
		<Row title={t('settings-network-ip-search-domains')} description={t('settings-network-ip-search-domains.description')}>
			<div class="w-[260px]">
				<TextField
					label={t('settings-network-ip-search-domains.label', { family: title })}
					bind:value={() => search, (text) => ((search = text), (ip.search = words(text)))}
					placeholder={t('settings-network-optional')}
					error={errors[`${family}.search`]}
				/>
			</div>
		</Row>
		{#if automatic}
			<Row title={t('settings-network-ip-automatic-routes')} description={t('settings-network-ip-automatic-routes.description')}>
				<Switch label={t('settings-network-ip-automatic-routes')} checked={ip.automaticRoutes} onchange={(on) => (ip.automaticRoutes = on)} />
			</Row>
		{/if}
		<Row title={t('settings-network-ip-routes')} description={t('settings-network-ip-routes.description')}>
			{#snippet below()}
				{#each ip.routes as route, index (route)}
					<RouteRow bind:route={ip.routes[index]} {family} {index} {errors} onremove={() => ip.routes.splice(index, 1)} />
				{/each}
				<button type="button" class="button self-start" onclick={addRoute}>{t('settings-network-ip-add-route')}</button>
			{/snippet}
		</Row>
	{/if}
</Section>
