<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import Minus from '@lucide/svelte/icons/minus';
	import Square from '@lucide/svelte/icons/square';
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';

	interface Props {
		maximizable?: boolean;
		closable?: boolean;
		onclose?: () => void;
	}

	let { maximizable = true, closable = true, onclose = () => appWindow.close() }: Props = $props();
</script>

<div class="flex items-center gap-1" data-no-drag>
	<button type="button" class="window-control" aria-label={t('ui-window-minimize')} onclick={() => appWindow.minimize()}>
		<Minus size={16} />
	</button>
	{#if maximizable}
		<button type="button" class="window-control" aria-label={t('ui-window-maximize')} onclick={() => appWindow.toggleMaximize()}>
			<Square size={13} />
		</button>
	{/if}
	<button type="button" class="window-control" aria-label={t('ui-window-close')} disabled={!closable} onclick={onclose}>
		<X size={16} />
	</button>
</div>
