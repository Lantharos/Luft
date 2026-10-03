<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';

	interface Props {
		items: { id: string; passed: boolean; sentence: string }[];
	}

	let { items }: Props = $props();
</script>

<ul class="flex flex-col gap-2.5 px-1">
	{#each items as item (item.id)}
		<li class="flex items-start gap-3 text-[13px] leading-relaxed">
			<span class="mt-0.5 flex-none">
				{#if item.passed}
					<CircleCheck size={16} class="text-[var(--success)]" />
				{:else}
					<CircleAlert size={16} class="text-[var(--danger)]" />
				{/if}
			</span>
			<span class={item.passed ? 'text-[var(--text-soft)]' : 'text-[var(--text)]'}>{item.sentence}</span>
		</li>
	{/each}
</ul>
