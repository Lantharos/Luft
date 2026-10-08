<script lang="ts">
	import { useApp } from '#lib/app/context.js';

	const app = useApp();

	const ACTIONS = ['file.new', 'file.open', 'folder.open', 'palette.files', 'palette.commands'];
	let actions = $derived(ACTIONS.map((id) => app.commands.find((command) => command.id === id)!));
</script>

<div class="absolute inset-0 grid place-items-center bg-[var(--content)]">
	<div class="flex w-[300px] flex-col gap-0.5">
		{#each actions as action (action.id)}
			<button type="button" class="welcome-action" onclick={action.run}>
				<span>{action.title}</span>
				<span class="text-[var(--text-muted)]">{action.keys?.[0]}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.welcome-action {
		display: flex;
		height: 38px;
		align-items: center;
		justify-content: space-between;
		border-radius: var(--radius-pill);
		padding-inline: 16px;
		color: var(--text-soft);
		font-size: 13.5px;
		transition: background-color 140ms var(--ease), color 140ms var(--ease);
	}

	.welcome-action:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
