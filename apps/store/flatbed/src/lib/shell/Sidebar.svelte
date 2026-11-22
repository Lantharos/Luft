<script lang="ts">
	import { t } from '@luft/i18n';
	import { selectionPill, Spinner } from '@luft/ui';
	import Camera from '@luft/symbols/icons/camera';
	import Plus from '@luft/symbols/icons/plus';
	import Printer from '@luft/symbols/icons/printer';
	import Settings from '@luft/symbols/icons/settings';
	import Usb from '@luft/symbols/icons/usb';
	import { CAMERA, flatbed } from '#lib/app/flatbed.svelte.js';

	let { onadd, onsettings }: { onadd: () => void; onsettings: () => void } = $props();
</script>

<aside class="glass-sidebar drag-region flex flex-col px-3 pt-4 pb-3">
	<h2 class="nav-heading">{t('sources-title')}</h2>
	<nav class="flex flex-col gap-0.5" data-no-drag {@attach selectionPill()}>
		{#each flatbed.scanners as scanner (scanner.id)}
			{@const Icon = scanner.connection === 'usb' ? Usb : Printer}
			<button
				type="button"
				class="nav-item tall"
				class:active={flatbed.source === scanner.id}
				aria-current={flatbed.source === scanner.id ? 'page' : undefined}
				disabled={flatbed.scanning}
				onclick={() => flatbed.choose(scanner.id)}
			>
				<Icon size={18} />
				<span class="min-w-0 flex-1">
					<span class="block truncate">{scanner.name}</span>
					<span class="nav-detail block truncate">
						{scanner.connection === 'usb' ? t('source-usb') : t('source-network')}
					</span>
				</span>
			</button>
		{/each}
		{#if flatbed.searching}
			<div class="nav-item quiet pointer-events-none" role="status">
				<Spinner size={18} />
				<span class="truncate">{t('sources-searching')}</span>
			</div>
		{/if}
		<button
			type="button"
			class="nav-item tall"
			class:active={flatbed.source === CAMERA}
			aria-current={flatbed.source === CAMERA ? 'page' : undefined}
			disabled={flatbed.scanning}
			onclick={() => flatbed.choose(CAMERA)}
		>
			<Camera size={18} />
			<span class="min-w-0 flex-1">
				<span class="block truncate">{t('source-camera')}</span>
				<span class="nav-detail block truncate">{t('source-camera-detail')}</span>
			</span>
		</button>
		<button type="button" class="nav-item quiet" onclick={onadd}>
			<Plus size={18} />
			<span class="truncate">{t('source-add')}</span>
		</button>
	</nav>
	<div class="flex-1"></div>
	<button type="button" class="nav-item quiet" data-no-drag onclick={onsettings}>
		<Settings size={18} />
		<span class="truncate">{t('settings-open')}</span>
	</button>
</aside>
