<script lang="ts">
	import { Dialog } from '@luft/ui';
	import type { Command } from '$lib/app/commands';

	interface Props {
		commands: Command[];
		onclose: () => void;
	}

	let { commands, onclose }: Props = $props();

	let shown = $derived(commands.filter((command) => command.keys));
</script>

<Dialog title="Keyboard shortcuts" description="Press Ctrl+K anywhere to find any command." wide {onclose}>
	<div class="grid grid-cols-2 gap-x-6 gap-y-1">
		{#each shown as command (command.id)}
			<div class="flex min-h-[34px] items-center gap-3 text-[13px]">
				<span class="min-w-0 flex-1 truncate text-[var(--text-soft)]">{command.title}</span>
				<span class="flex gap-1">{#each command.keys!.split(' ') as key, index (index)}<kbd>{key}</kbd>{/each}</span>
			</div>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>

<style>
	kbd {
		min-width: 24px;
		border-radius: 7px;
		background: var(--control);
		padding: 2px 7px;
		text-align: center;
		font-family: inherit;
		font-size: 12px;
		color: var(--text-soft);
	}
</style>
