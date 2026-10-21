<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes } from '@luft/ui';
	import type { Drive, Space } from '#lib/bridge/installer.js';
	import WindowsOptions from './WindowsOptions.svelte';

	interface Props {
		drive: Drive;
		space: Space;
		packed: number | null;
		elsewhere: boolean;
	}

	let { drive, space, packed, elsewhere }: Props = $props();

	let luftSize = $derived(t('setup-meet-room-luft', { size: bytes(space.size) }));
	let windows = $derived(drive.windows && !drive.windows.blocked ? drive.windows : null);
</script>

<div class="flex flex-col gap-6">
	<div class="flex h-16 gap-1.5">
		{#if !elsewhere}
			<div class="windows flex min-w-28 basis-0 items-end rounded-[16px] p-3 text-[13px] font-medium" style:flex-grow={drive.windows?.size ?? drive.size - space.size}>Windows</div>
		{/if}
		<div class="luft flex min-w-36 basis-0 items-end rounded-[16px] p-3 text-[13px] font-medium" style:flex-grow={space.size}>{luftSize}</div>
	</div>
	{#if packed}
		<p class="text-[13.5px] leading-relaxed text-[var(--text-soft)]">{t('setup-meet-room-packed', { size: bytes(packed) })}</p>
	{/if}
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
