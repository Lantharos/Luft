<script lang="ts">
	import { appWindow, isAvailable } from '@lantharos/sabine';
	import Minus from '@lucide/svelte/icons/minus';
	import Square from '@lucide/svelte/icons/square';
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';

	interface Props {
		onclose?: () => void;
	}

	let { onclose }: Props = $props();

	const controls = [
		{ label: 'ui-window-minimize', icon: Minus, size: 16, run: () => isAvailable() && appWindow.minimize() },
		{ label: 'ui-window-maximize', icon: Square, size: 13, run: () => isAvailable() && appWindow.toggleMaximize() },
		{ label: 'ui-window-close', icon: X, size: 16, run: () => (onclose ? onclose() : isAvailable() && appWindow.close()) }
	];
</script>

<div class="flex items-center gap-1" data-no-drag>
	{#each controls as control (control.label)}
		<button type="button" class="window-control" aria-label={t(control.label)} onclick={control.run}>
			<control.icon size={control.size} />
		</button>
	{/each}
</div>
