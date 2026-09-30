<script lang="ts">
	export interface Fact {
		label: string;
		value: string | string[] | null | undefined;
		mono?: boolean;
	}

	interface Props {
		title: string;
		facts: Fact[];
	}

	let { title, facts }: Props = $props();

	let shown = $derived(facts.filter((fact) => (Array.isArray(fact.value) ? fact.value.length : fact.value)));
</script>

{#if shown.length}
	<section class="flex flex-col gap-2">
		<h2 class="px-1 text-[13px] font-medium text-[var(--text-soft)]">{title}</h2>
		<dl class="facts">
			{#each shown as fact (fact.label)}
				<div class="fact">
					<dt>{fact.label}</dt>
					<dd class:font-mono={fact.mono} class:mono={fact.mono}>
						{#each [fact.value].flat() as line (line)}
							<span class="block truncate">{line}</span>
						{/each}
					</dd>
				</div>
			{/each}
		</dl>
	</section>
{/if}

<style>
	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		column-gap: 32px;
		padding-inline: 4px;
	}

	.fact {
		display: flex;
		min-width: 0;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		padding-block: 9px;
		border-bottom: 1px solid var(--hairline);
		font-size: 13px;
	}

	dt {
		flex: none;
		color: var(--text-muted);
	}

	dd {
		min-width: 0;
		overflow: hidden;
		text-align: right;
		text-overflow: ellipsis;
		white-space: nowrap;
		user-select: text;
	}

	.mono {
		font-size: 12px;
		font-variant-ligatures: none;
	}
</style>
