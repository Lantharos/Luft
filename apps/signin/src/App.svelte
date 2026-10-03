<script lang="ts">
	import { onMount } from 'svelte';
	import { isAvailable } from '@lantharos/sabine';
	import { appearance, WindowControls } from '@luft/ui';
	import Lock from '@lucide/svelte/icons/lock';
	import LockOpen from '@lucide/svelte/icons/lock-open';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import { signIn } from '#lib/signin.svelte.js';

	let page: HTMLDivElement;

	onMount(() => {
		const resize = new ResizeObserver(() => signIn.place(page.getBoundingClientRect()));
		resize.observe(page);
		if (!isAvailable()) return () => resize.disconnect();
		const stopping = signIn.start();
		return () => {
			resize.disconnect();
			void stopping.then((stop) => stop());
		};
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});
</script>

<div class="glass-shell flex-col">
	<header class="drag-region flex h-[52px] flex-none items-center gap-3 pr-3 pl-4">
		<button type="button" class="icon-button" aria-label="Reload" onclick={() => signIn.reload()}>
			<RotateCw size={16} class={signIn.loading ? 'animate-spin' : ''} />
		</button>
		<div class="flex min-w-0 flex-1 items-center gap-2 text-[13px]">
			{#if signIn.network}
				<span class="truncate font-medium">{signIn.network}</span>
			{/if}
			{#if signIn.host}
				<span class="flex min-w-0 items-center gap-1.5 text-[var(--text-muted)]">
					{#if signIn.secure}
						<Lock size={13} class="flex-none" aria-label="Secure connection" />
					{:else}
						<LockOpen size={13} class="flex-none text-[var(--danger)]" aria-label="Not secure" />
					{/if}
					<span class="truncate">{signIn.host}</span>
				</span>
			{/if}
		</div>
		<WindowControls />
	</header>
	<div bind:this={page} class="grid min-h-0 flex-1 place-items-center bg-[var(--content)] text-[13px] text-[var(--text-muted)]">
		Opening the network's sign-in page…
	</div>
</div>
