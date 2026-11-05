<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes } from '@luft/ui';

	interface Props {
		windows: number;
		windowsUsed: number;
		luft: number;
		luftUsed: number | null;
	}

	let { windows, windowsUsed, luft, luftUsed }: Props = $props();

	let total = $derived(windows + luft);
</script>

<div class="flex flex-col gap-3">
	<div class="flex h-16 gap-1.5">
		<div class="part windows" style:flex-grow={windows / total}>
			<div class="used" style:width="{(windowsUsed / windows) * 100}%"></div>
		</div>
		<div class="part luft" style:flex-grow={luft / total}>
			{#if luftUsed !== null}
				<div class="used" style:width="{(luftUsed / luft) * 100}%"></div>
			{/if}
		</div>
	</div>
	<div class="flex justify-between text-[13.5px]">
		<span><span class="font-semibold">Windows</span> <span class="text-[var(--text-soft)]">{t('luft-bar-used', { size: bytes(windows), used: bytes(windowsUsed) })}</span></span>
		<span>
			<span class="font-semibold">Luft</span>
			<span class="text-[var(--text-soft)]">{luftUsed === null ? bytes(luft) : t('luft-bar-used', { size: bytes(luft), used: bytes(luftUsed) })}</span>
		</span>
	</div>
</div>

<style>
	.part {
		position: relative;
		min-width: 28px;
		flex-basis: 0;
		overflow: hidden;
		border-radius: 16px;
	}

	.windows {
		background: color-mix(in oklab, var(--secondary) 30%, transparent);
	}

	.windows .used {
		height: 100%;
		background: color-mix(in oklab, var(--secondary) 55%, transparent);
	}

	.luft {
		background: color-mix(in oklab, var(--accent) 55%, transparent);
	}

	.luft .used {
		height: 100%;
		background: var(--accent);
	}
</style>
