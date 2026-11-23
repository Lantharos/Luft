<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import Minus from '@luft/symbols/icons/minus';
	import Square from '@luft/symbols/icons/square';
	import X from '@luft/symbols/icons/x';
	import { t } from '@luft/i18n';
	import { controlRegions } from './controlRegions';

	interface Props {
		minimizable?: boolean;
		maximizable?: boolean;
		closable?: boolean;
		onclose?: () => void;
	}

	let { minimizable = true, maximizable = true, closable = true, onclose }: Props = $props();

	let native = $derived(
		(['minimize', 'maximize', 'close'] as const).filter((action) => ({ minimize: minimizable, maximize: maximizable, close: closable && !onclose })[action])
	);
</script>

<div class="flex items-center gap-1" data-no-drag {@attach controlRegions(native)}>
	{#if minimizable}
		<button type="button" class="window-control" data-action="minimize" aria-label={t('ui-window-minimize')} onclick={() => appWindow.minimize()}>
			<Minus size={14} />
		</button>
	{/if}
	{#if maximizable}
		<button type="button" class="window-control" data-action="maximize" aria-label={t('ui-window-maximize')} onclick={() => appWindow.toggleMaximize()}>
			<Square size={14} />
		</button>
	{/if}
	<button type="button" class="window-control" data-action="close" aria-label={t('ui-window-close')} disabled={!closable} onclick={onclose ?? (() => appWindow.close())}>
		<X size={14} />
	</button>
</div>
