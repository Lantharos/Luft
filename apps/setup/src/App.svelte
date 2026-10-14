<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { isAvailable } from '@lantharos/sabine';
	import { appearance, GlassShell } from '@luft/ui';
	import SecureBoot from '#lib/steps/firstboot/SecureBoot.svelte';
	import Protect from '#lib/steps/firstboot/Protect.svelte';
	import Ready from '#lib/steps/firstboot/Ready.svelte';
	import Account from '#lib/steps/live/Account.svelte';
	import Destination from '#lib/steps/live/destination/Destination.svelte';
	import Finishing from '#lib/steps/live/Finishing.svelte';
	import Network from '#lib/steps/live/network/Network.svelte';
	import Region from '#lib/steps/live/Region.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { install } from '#lib/state/install.svelte.js';
	import { regional } from '#lib/state/regional.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';

	const STEPS = { region: Region, destination: Destination, network: Network, account: Account, finishing: Finishing, 'secure-boot': SecureBoot, protect: Protect, ready: Ready };
	const SLIDE = 28;

	onMount(() => {
		if (!isAvailable()) return;
		const stopping = setup.start();
		return () => void stopping.then((stop) => stop());
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	$effect(() => {
		void [regional.language, regional.keyboard, regional.zone];
		if (install.started && !install.failed) void install.configure().catch(() => {});
	});

	let Step = $derived(flow.step ? STEPS[flow.step] : null);
</script>

<GlassShell class="setup-window glass-surface">
	<main class="relative flex min-w-0 flex-1 flex-col overflow-hidden">
		<div class="drag-region absolute inset-x-0 top-0 z-10 h-10"></div>
		{#if setup.ready && Step}
			{#key flow.step}
				<div class="absolute inset-0" in:fly={{ x: SLIDE * flow.direction, duration: 260, easing: cubicOut }} out:fly={{ x: -SLIDE * flow.direction, duration: 160 }}>
					<Step />
				</div>
			{/key}
		{/if}
	</main>
</GlassShell>
