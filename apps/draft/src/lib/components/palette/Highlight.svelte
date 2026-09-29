<script lang="ts">
	let { text, matches = [] }: { text: string; matches?: number[] } = $props();

	let segments = $derived.by(() => {
		if (!matches.length) return [{ text, matched: false }];
		const matched = new Set(matches);
		const parts: { text: string; matched: boolean }[] = [];
		for (let index = 0; index < text.length; index++) {
			const isMatch = matched.has(index);
			const last = parts.at(-1);
			if (last && last.matched === isMatch) last.text += text[index];
			else parts.push({ text: text[index], matched: isMatch });
		}
		return parts;
	});
</script>

{#each segments as segment, index (index)}{#if segment.matched}<mark>{segment.text}</mark>{:else}{segment.text}{/if}{/each}

<style>
	mark {
		background: none;
		color: var(--accent);
		font-weight: 600;
	}
</style>
