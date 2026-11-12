<script lang="ts">
	import BrickWallShield from '@lucide/svelte/icons/brick-wall-shield';
	import { t } from '@luft/i18n';
	import type { Firewall } from '@luft/network';
	import { Row } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { app } from '#lib/state/app.svelte.js';
	import { firewallSummary } from '#lib/panels/connections/network/firewall/summary.js';

	let firewall = $state<Firewall | null>(null);

	$effect(() => {
		void commands
			.networkFirewall()
			.then((current) => (firewall = current))
			.catch(() => {});
	});
</script>

{#if firewall}
	<Row title={t('settings-page-firewall')} description={firewallSummary(firewall)} icon={BrickWallShield} onclick={() => app.open('network/firewall')} />
{/if}
