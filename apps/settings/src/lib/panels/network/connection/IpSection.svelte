<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import { IconButton, Row, Section, Select, Switch, TextField } from '@luft/ui';
	import RouteRow from './RouteRow.svelte';
	import { configurable, type Family, type Ip } from './profile';
	import { words, type Errors } from './validate';

	interface Props {
		family: Family;
		ip: Ip;
		errors: Errors;
	}

	const METHOD_LABELS: Record<string, string> = {
		auto: 'Automatic',
		dhcp: 'Automatic, addresses only',
		manual: 'Manual',
		'link-local': 'Link-local only',
		shared: 'Shared with other devices',
		ignore: 'Not managed',
		disabled: 'Off'
	};
	const OFFERED = ['auto', 'manual', 'link-local', 'disabled'];

	let { family, ip = $bindable(), errors }: Props = $props();

	let dns = $state(untrack(() => ip.dns.join(', ')));
	let search = $state(untrack(() => ip.search.join(', ')));

	let title = $derived(family === 'ipv4' ? 'IPv4' : 'IPv6');
	let example = $derived(family === 'ipv4' ? '192.168.1.20/24' : '2001:db8::20/64');
	let automatic = $derived(ip.method === 'auto' || ip.method === 'dhcp');
	let methods = $derived((OFFERED.includes(ip.method) ? OFFERED : [...OFFERED, ip.method]).map((value) => ({ value, label: METHOD_LABELS[value] ?? value })));

	function addRoute() {
		ip.routes.push({ destination: '', gateway: '', metric: null });
	}
</script>

<Section title={title}>
	<Row title="Method">
		<Select label="{title} method" options={methods} value={ip.method} onchange={(method) => (ip.method = method)} />
	</Row>
	{#if ip.method === 'manual'}
		<Row title="Addresses" description="Each with its prefix, like {example}">
			{#snippet below()}
				{#each ip.addresses as _, index (index)}
					<div class="flex items-start gap-2">
						<div class="flex-1">
							<TextField label="Address {index + 1}" bind:value={ip.addresses[index]} placeholder={example} error={errors[`${family}.address.${index}`]} />
						</div>
						<IconButton icon={X} label="Remove address" onclick={() => ip.addresses.splice(index, 1)} />
					</div>
				{/each}
				{#if errors[`${family}.addresses`]}
					<p class="text-[12.5px] text-[var(--danger)]">{errors[`${family}.addresses`]}</p>
				{/if}
				<button type="button" class="button self-start" onclick={() => ip.addresses.push('')}>Add address</button>
			{/snippet}
		</Row>
		<Row title="Router">
			<div class="w-[260px]">
				<TextField label="{title} router" bind:value={ip.gateway} placeholder="Optional" error={errors[`${family}.gateway`]} />
			</div>
		</Row>
	{/if}
	{#if configurable(ip.method)}
		{#if automatic}
			<Row title="Automatic DNS" description="Use the DNS servers this network suggests">
				<Switch label="Automatic DNS" checked={ip.automaticDns} onchange={(on) => (ip.automaticDns = on)} />
			</Row>
		{/if}
		<Row title="DNS servers" description={automatic && ip.automaticDns ? 'Used before the suggested ones' : 'Separate addresses with commas'}>
			<div class="w-[260px]">
				<TextField
					label="{title} DNS servers"
					bind:value={() => dns, (text) => ((dns = text), (ip.dns = words(text)))}
					placeholder={automatic ? 'Optional' : ''}
					error={errors[`${family}.dns`]}
				/>
			</div>
		</Row>
		<Row title="Search domains" description="Tried when a name has no domain, like “printer”">
			<div class="w-[260px]">
				<TextField
					label="{title} search domains"
					bind:value={() => search, (text) => ((search = text), (ip.search = words(text)))}
					placeholder="Optional"
					error={errors[`${family}.search`]}
				/>
			</div>
		</Row>
		{#if automatic}
			<Row title="Automatic routes" description="Use the routes this network suggests">
				<Switch label="Automatic routes" checked={ip.automaticRoutes} onchange={(on) => (ip.automaticRoutes = on)} />
			</Row>
		{/if}
		<Row title="Routes" description="Send traffic for specific networks through a router you choose">
			{#snippet below()}
				{#each ip.routes as route, index (route)}
					<RouteRow bind:route={ip.routes[index]} {family} {index} {errors} onremove={() => ip.routes.splice(index, 1)} />
				{/each}
				<button type="button" class="button self-start" onclick={addRoute}>Add route</button>
			{/snippet}
		</Row>
	{/if}
</Section>
