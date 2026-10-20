<script lang="ts">
	import { appWindow, isAvailable } from '@lantharos/sabine';
	import Minus from '@lucide/svelte/icons/minus';
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';

	interface Props {
		closable: boolean;
	}

	let { closable }: Props = $props();
</script>

<div class="flex items-center gap-1" data-no-drag>
	<button type="button" class="window-control" aria-label={t('ui-window-minimize')} onclick={() => isAvailable() && appWindow.minimize()}>
		<Minus size={16} />
	</button>
	<button type="button" class="window-control" aria-label={t('ui-window-close')} disabled={!closable} onclick={() => isAvailable() && appWindow.close()}>
		<X size={16} />
	</button>
</div>
