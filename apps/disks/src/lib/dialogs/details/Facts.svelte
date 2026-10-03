<script lang="ts">
	interface Fact {
		label: string;
		value: string;
		mono?: boolean;
		open?: () => void;
	}

	interface Props {
		facts: Fact[];
	}

	let { facts }: Props = $props();
</script>

<dl class="facts">
	{#each facts as fact (fact.label)}
		<dt>{fact.label}</dt>
		<dd class:mono={fact.mono}>
			{#if fact.open}
				<button type="button" class="link" onclick={fact.open}>{fact.value}</button>
			{:else}
				{fact.value}
			{/if}
		</dd>
	{/each}
</dl>

<style>
	.facts {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: 10px 24px;
		padding: 0 4px;
		font-size: 13px;
	}

	dt {
		color: var(--text-muted);
	}

	dd {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		user-select: text;
	}

	.mono {
		font-family: var(--font-mono);
		font-size: 12px;
	}

	.link {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		text-decoration: underline;
		text-decoration-color: var(--hairline);
		text-underline-offset: 3px;
	}

	.link:hover {
		text-decoration-color: currentColor;
	}
</style>
