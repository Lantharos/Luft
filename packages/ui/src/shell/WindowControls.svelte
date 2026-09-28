<script lang="ts">
	import { appWindow, isAvailable } from '@lantharos/sabine';
	import Minus from '@lucide/svelte/icons/minus';
	import Square from '@lucide/svelte/icons/square';
	import X from '@lucide/svelte/icons/x';

	const controls = [
		{ label: 'Minimize', icon: Minus, size: 16, run: () => appWindow.minimize() },
		{ label: 'Maximize', icon: Square, size: 13, run: () => appWindow.toggleMaximize() },
		{ label: 'Close', icon: X, size: 16, run: () => appWindow.close() }
	];
</script>

<div class="flex items-center gap-1" data-no-drag>
	{#each controls as control (control.label)}
		<button type="button" class="window-control" aria-label={control.label} onclick={() => isAvailable() && control.run()}>
			<control.icon size={control.size} />
		</button>
	{/each}
</div>
