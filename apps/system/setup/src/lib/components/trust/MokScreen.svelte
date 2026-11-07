<script lang="ts">
	interface Props {
		heading: string;
		items: string[];
		highlighted?: number;
		prompt?: string;
		footer?: string;
	}

	let { heading, items, highlighted = -1, prompt, footer }: Props = $props();
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
	{#if footer}
		<div class="footer">{footer}</div>
	{/if}
</div>

<style>
	.screen {
		position: relative;
		display: flex;
		aspect-ratio: 4 / 3;
		flex-direction: column;
		align-items: center;
		overflow: hidden;
		border-radius: 8px;
		padding: 6% 5%;
		background: #0000a8;
		box-shadow:
			inset 0 0 0 3px #0000a8,
			inset 0 0 0 4px #a8a8a8;
		color: #a8a8a8;
		font-family: var(--font-mono);
		font-size: 7.5px;
		line-height: 1.45;
		text-align: center;
	}

	.heading {
		white-space: nowrap;
	}

	.menu {
		display: flex;
		margin: auto 0;
		flex-direction: column;
		align-items: stretch;
		padding: 2px 0;
		box-shadow: 0 0 0 1px #a8a8a8;
	}

	.item {
		padding: 0 5px;
		white-space: nowrap;
	}

	.item.on {
		background: #000000;
		color: #ffffff;
	}

	.prompt {
		margin: auto 0;
		white-space: pre-line;
	}

	.footer {
		position: absolute;
		bottom: 6%;
		left: 6%;
	}
</style>
