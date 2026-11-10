<script lang="ts">
	import Coffee from '@lucide/svelte/icons/coffee';
	import House from '@lucide/svelte/icons/house';
	import { i18n, t } from '@luft/i18n';
	import { Spinner } from '@luft/ui';
	import type { NetworkType } from '@luft/network';
	import { commands } from '#lib/bindings.js';
	import OptionRow from '#lib/components/OptionRow.svelte';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';

	let choice = $state<NetworkType>('home');
	let busy = $state(false);
	let problem = $state('');

	let names = $derived(new Intl.ListFormat(i18n.formats, { type: 'conjunction' }).format(setup.newNetworks.map((network) => network.name)));

	async function keep() {
		busy = true;
		problem = '';
		try {
			for (const network of setup.newNetworks) await commands.installerNetworkType({ connection: network.connection, networkType: choice });
			flow.next();
		} catch (error) {
			problem = String(error);
		} finally {
			busy = false;
		}
	}
</script>

<StepFrame title={t('setup-network-type-title')} description={t('setup-network-type-description', { network: names })}>
	<div class="flex flex-col gap-1" role="radiogroup">
		<OptionRow icon={House} title={t('setup-network-type-home')} detail={t('setup-network-type-home.detail')} selected={choice === 'home'} onclick={() => (choice = 'home')} />
		<OptionRow icon={Coffee} title={t('setup-network-type-public')} detail={t('setup-network-type-public.detail')} selected={choice === 'public'} onclick={() => (choice = 'public')} />
	</div>
	{#if problem}
		<p class="mt-5 text-[13.5px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button primary large px-6" disabled={busy} onclick={keep}>{#if busy}<Spinner />{/if}{t('setup-continue')}</button>
	{/snippet}
</StepFrame>
