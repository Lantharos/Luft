<script lang="ts">
	const ALLOWED = new Set(['P', 'UL', 'OL', 'LI', 'EM', 'CODE', 'STRONG', 'B', 'I', 'BR']);

	let { html }: { html: string } = $props();

	function clean(node: Node): string {
		if (node.nodeType === Node.TEXT_NODE) return escape(node.textContent ?? '');
		if (!(node instanceof Element)) return '';
		const inner = [...node.childNodes].map(clean).join('');
		if (!ALLOWED.has(node.tagName)) return inner;
		const tag = node.tagName.toLowerCase();
		return tag === 'br' ? '<br>' : `<${tag}>${inner}</${tag}>`;
	}

	function escape(text: string) {
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	const safe = $derived.by(() => {
		const document = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
		return [...document.body.childNodes].map(clean).join('').trim();
	});
</script>

<div class="description">{@html safe}</div>

<style>
	.description {
		display: flex;
		flex-direction: column;
		gap: 10px;
		font-size: 14px;
		line-height: 1.6;
		color: var(--text-soft);
	}

	.description :global(ul),
	.description :global(ol) {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding-left: 20px;
	}

	.description :global(ul) {
		list-style: disc;
	}

	.description :global(ol) {
		list-style: decimal;
	}

	.description :global(code) {
		font-family: var(--font-mono);
		font-size: 12.5px;
	}
</style>
