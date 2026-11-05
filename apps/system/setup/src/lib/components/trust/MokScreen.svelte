<script lang="ts">
	interface Props {
		heading: string;
		items: string[];
		highlighted?: number;
		prompt?: string;
	}

	let { heading, items, highlighted = -1, prompt }: Props = $props();
</script>

<div class="screen" aria-hidden="true">
	<div class="heading">{heading}</div>
	{#if prompt}
		<div class="prompt">{prompt}</div>
	{:else}
		<div class="menu">
			{#each items as item, index (item)}
				<div class="item" class:on={index === highlighted}>{item}</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.screen {
		display: flex;
		aspect-ratio: 4 / 3;
		flex-direction: column;
		gap: 8%;
		overflow: hidden;
		border-radius: 10px;
		padding: 10% 8%;
		background: #0b2d8f;
		color: #c8cdd8;
		font-family: var(--font-mono);
		font-size: 8.5px;
		line-height: 1.5;
		box-shadow: 0 6px 20px var(--shadow-faint);
	}

	.heading {
		align-self: center;
		padding: 2px 8px;
		background: #c8cdd8;
		color: #0b2d8f;
	}

	.menu {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.item {
		padding: 0 6px;
	}

	.item.on {
		background: #c8cdd8;
		color: #0b2d8f;
	}

	.prompt {
		align-self: center;
		margin-top: 12%;
		text-align: center;
		white-space: pre-line;
	}
</style>
