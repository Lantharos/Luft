<script lang="ts">
	import { t } from '@luft/i18n';
	import { selectionPill } from '@luft/ui';
	import Camera from '@lucide/svelte/icons/camera';
	import Plus from '@lucide/svelte/icons/plus';
	import Printer from '@lucide/svelte/icons/printer';
	import Settings from '@lucide/svelte/icons/settings';
	import Usb from '@lucide/svelte/icons/usb';
	import { CAMERA, flatbed } from '#lib/app/flatbed.svelte.js';

	let { onadd, onsettings }: { onadd: () => void; onsettings: () => void } = $props();
</script>

<aside class="glass-sidebar drag-region flex flex-col px-3 pt-4 pb-3">
	<p class="px-3 pt-2 pb-2 text-[13px] font-semibold text-[var(--sidebar-text-muted)]">{t('sources-title')}</p>
	<nav class="flex flex-col gap-0.5" data-no-drag {@attach selectionPill()}>
		{#each flatbed.scanners as scanner (scanner.id)}
			{@const Icon = scanner.connection === 'usb' ? Usb : Printer}
			<button
				type="button"
				class="source"
				class:active={flatbed.source === scanner.id}
				aria-current={flatbed.source === scanner.id ? 'page' : undefined}
				disabled={flatbed.scanning}
				onclick={() => flatbed.choose(scanner.id)}
			>
				<Icon size={17} />
				<span class="min-w-0 flex-1">
					<span class="block truncate">{scanner.name}</span>
					<span class="block truncate text-[12px] text-[var(--sidebar-text-muted)]">
						{scanner.connection === 'usb' ? t('source-usb') : t('source-network')}
					</span>
				</span>
			</button>
		{/each}
		<button
			type="button"
			class="source"
			class:active={flatbed.source === CAMERA}
			aria-current={flatbed.source === CAMERA ? 'page' : undefined}
			disabled={flatbed.scanning}
			onclick={() => flatbed.choose(CAMERA)}
		>
			<Camera size={17} />
			<span class="min-w-0 flex-1">
				<span class="block truncate">{t('source-camera')}</span>
				<span class="block truncate text-[12px] text-[var(--sidebar-text-muted)]">{t('source-camera-detail')}</span>
			</span>
		</button>
		<button type="button" class="source quiet" onclick={onadd}>
			<Plus size={17} />
			<span class="truncate">{t('source-add')}</span>
		</button>
	</nav>
	{#if !flatbed.scanners.length}
		<p class="px-3 pt-3 text-[12px] leading-[1.45] text-[var(--sidebar-text-muted)]">{t('sources-looking')}</p>
	{/if}
	<div class="flex-1"></div>
	<button type="button" class="source quiet" data-no-drag onclick={onsettings}>
		<Settings size={17} />
		<span class="truncate">{t('settings-open')}</span>
	</button>
</aside>

<style>
	.source {
		display: flex;
		min-height: 36px;
		width: 100%;
		align-items: center;
		gap: 12px;
		border-radius: 14px;
		padding: 7px 12px;
		text-align: left;
		font-size: 14px;
		color: var(--sidebar-text);
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate),
			transform var(--motion-tap) var(--ease-decelerate);
	}

	.source:hover:not(:disabled) {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.source.active {
		background: transparent;
		color: var(--text);
	}

	.source:disabled:not(.active) {
		opacity: 0.5;
	}

	.source.quiet {
		color: var(--sidebar-text-muted);
	}

	.source:active:not(:disabled) {
		transform: scale(0.97);
	}
</style>
