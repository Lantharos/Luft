<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { untrack } from 'svelte';
	import { IconButton, TextField } from '@luft/ui';
	import type { Family, Route } from './profile';
	import type { Errors } from './validate';

	interface Props {
		route: Route;
		family: Family;
		index: number;
		errors: Errors;
		onremove: () => void;
	}

	let { route = $bindable(), family, index, errors, onremove }: Props = $props();

	let metric = $state(untrack(() => (route.metric === null ? '' : String(route.metric))));
	let touched = $state({ destination: false, gateway: false, metric: false });
	let key = $derived(`${family}.route.${index}`);
	let message = $derived((['destination', 'gateway', 'metric'] as const).map((field) => (touched[field] ? errors[`${key}.${field}`] : undefined)).find(Boolean));

	function setMetric(text: string) {
		metric = text;
		route.metric = text.trim() ? Number(text) : null;
	}
</script>

<div class="flex flex-col gap-1.5">
	<div class="route">
		<TextField
			label="Network"
			bind:value={route.destination}
			bind:touched={touched.destination}
			placeholder={family === 'ipv4' ? '10.0.0.0/8' : '2001:db8::/32'}
			invalid={Boolean(errors[`${key}.destination`])}
		/>
		<TextField label="Router" bind:value={route.gateway} bind:touched={touched.gateway} placeholder="Router" invalid={Boolean(errors[`${key}.gateway`])} />
		<TextField
			label="Priority"
			bind:value={() => metric, setMetric}
			bind:touched={touched.metric}
			placeholder="Priority"
			inputmode="numeric"
			invalid={Boolean(errors[`${key}.metric`])}
		/>
		<IconButton icon={X} label="Remove route" onclick={onremove} />
	</div>
	{#if message}
		<p class="px-3.5 text-[12.5px] text-[var(--danger)]">{message}</p>
	{/if}
</div>

<style>
	.route {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) 96px auto;
		align-items: center;
		gap: 8px;
	}
</style>
