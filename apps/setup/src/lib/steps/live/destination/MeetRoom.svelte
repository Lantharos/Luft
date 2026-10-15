<script lang="ts">
	import { bytes } from '@luft/ui';
	import type { Drive, Space } from '#lib/api/installer.js';
	import WindowsOptions from './WindowsOptions.svelte';

	interface Props {
		drive: Drive;
		space: Space;
		packed: number | null;
	}

	let { drive, space, packed }: Props = $props();

	let windows = $derived(drive.windows && !drive.windows.blocked ? drive.windows : null);
</script>

<div class="flex flex-col gap-6">
	<div class="flex h-16 gap-1.5">
		<div class="windows flex min-w-28 basis-0 items-end rounded-[16px] p-3 text-[13px] font-medium" style:flex-grow={drive.windows?.size ?? drive.size - space.size}>Windows</div>
		<div class="luft flex min-w-36 basis-0 items-end rounded-[16px] p-3 text-[13px] font-medium" style:flex-grow={space.size}>Luft, {bytes(space.size)}</div>
	</div>
	<p class="text-[13.5px] leading-relaxed text-[var(--text-soft)]">
		Meet Luft already made this room on {drive.name}, so Windows stays just as it is.
		{#if packed}
			Your moving box, {bytes(packed)}, is unpacked into your new account.
		{/if}
	</p>
	{#if windows}
		<WindowsOptions {windows} />
	{/if}
</div>

<style>
	.windows {
		background: color-mix(in oklab, var(--secondary) 30%, transparent);
	}

	.luft {
		background: var(--accent);
		color: var(--accent-text);
	}
</style>
