<script lang="ts">
	import { GUST_BOX, GUST_PARTS, GUST_PATHS, type GustFills, type GustPart } from './gust';

	interface Props {
		fills: GustFills | undefined;
		size: number;
	}

	let { fills, size }: Props = $props();

	const id = $props.id();
	const fillOf = (part: GustPart) => {
		const fill = fills?.[part];
		return typeof fill === 'object' ? `url(#${id}-${part})` : fill;
	};
</script>

<svg viewBox="0 0 {GUST_BOX} {GUST_BOX}" width={size} height={size} aria-hidden="true">
	<defs>
		{#each GUST_PARTS as part (part)}
			{@const fill = fills?.[part]}
			{#if typeof fill === 'object'}
				<linearGradient id="{id}-{part}" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stop-color={fill[0]} />
					<stop offset="1" stop-color={fill[1]} />
				</linearGradient>
			{/if}
		{/each}
	</defs>
	{#each GUST_PARTS as part (part)}
		<path d={GUST_PATHS[part]} fill={fillOf(part)} />
	{/each}
</svg>
