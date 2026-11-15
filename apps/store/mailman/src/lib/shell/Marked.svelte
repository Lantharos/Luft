<script lang="ts">
	let { text }: { text: string } = $props();

	const TAGGED = /<(b|kbd)>(.*?)<\/\1>/g;

	let parts = $derived.by(() => {
		const found: { tag: 'b' | 'kbd' | null; text: string }[] = [];
		let at = 0;
		for (const match of text.matchAll(TAGGED)) {
			if (match.index > at) found.push({ tag: null, text: text.slice(at, match.index) });
			found.push({ tag: match[1] as 'b' | 'kbd', text: match[2] });
			at = match.index + match[0].length;
		}
		if (at < text.length) found.push({ tag: null, text: text.slice(at) });
		return found;
	});
</script>

{#each parts as part, index (index)}{#if part.tag === 'b'}<b>{part.text}</b>{:else if part.tag === 'kbd'}<kbd>{part.text}</kbd>{:else}{part.text}{/if}{/each}
