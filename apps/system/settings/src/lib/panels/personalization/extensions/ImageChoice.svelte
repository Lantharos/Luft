<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import PreviewCard from '#lib/components/PreviewCard.svelte';

	interface Option {
		value: string;
		label: string;
		image: string;
	}

	interface Props {
		label: string;
		options: Option[];
		value: string;
		onchange: (value: string) => void;
	}

	let { label, options, value, onchange }: Props = $props();

	let missing = $state<string[]>([]);
</script>

<div class="pictures" role="radiogroup" aria-label={label}>
	{#each options as option (option.value)}
		<PreviewCard label={option.label} selected={value === option.value} onclick={() => onchange(option.value)}>
			{#if missing.includes(option.image)}
				<span class="picture missing"></span>
			{:else}
				<img class="picture" src={fileUrl(option.image)} alt="" decoding="async" onerror={() => missing.push(option.image)} />
			{/if}
		</PreviewCard>
	{/each}
</div>

<style>
	.pictures {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 6px;
	}

	.picture {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 2;
		border-radius: 12px;
		object-fit: cover;
	}

	.missing {
		background: var(--surface-hover);
	}
</style>
