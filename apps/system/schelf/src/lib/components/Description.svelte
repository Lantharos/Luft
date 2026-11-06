<script lang="ts">
	import { openUrl } from '#lib/bridge/index.js';

	const ALLOWED = new Set(['P', 'UL', 'OL', 'LI', 'EM', 'CODE', 'PRE', 'STRONG', 'B', 'I', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
	const EMPTY = new Set(['BR', 'HR']);
	const WEB_LINK = /^https?:/i;

	let { html }: { html: string } = $props();

	function clean(node: Node): string {
		if (node.nodeType === Node.TEXT_NODE) return escape(node.textContent ?? '');
		if (!(node instanceof Element)) return '';
		const tag = node.tagName.toLowerCase();
		if (EMPTY.has(node.tagName)) return `<${tag}>`;
		const inner = [...node.childNodes].map(clean).join('');
		if (node instanceof HTMLAnchorElement) return WEB_LINK.test(node.href) ? `<a href="${escape(node.href)}">${inner}</a>` : inner;
		return ALLOWED.has(node.tagName) ? `<${tag}>${inner}</${tag}>` : inner;
	}

	function escape(text: string) {
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	const safe = $derived.by(() => {
		const document = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
		return [...document.body.childNodes].map(clean).join('').trim();
	});

	function followLink(event: MouseEvent) {
		const link = (event.target as Element).closest('a');
		if (!link) return;
		event.preventDefault();
		openUrl(link.href);
	}
</script>

<div class="description" role="presentation" onclick={followLink}>{@html safe}</div>

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

	.description :global(pre) {
		overflow-x: auto;
		padding: 10px 12px;
		border-radius: 10px;
		background: var(--surface);
	}

	.description :global(strong),
	.description :global(b),
	.description :global(:is(h1, h2, h3, h4, h5, h6)) {
		font-weight: 600;
		color: var(--text);
	}

	.description :global(:is(h1, h2, h3, h4, h5, h6)) {
		margin-top: 4px;
		font-size: 14px;
	}

	.description :global(a) {
		color: var(--text);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.description :global(blockquote) {
		padding-left: 12px;
		color: var(--text-muted);
	}

	.description :global(hr) {
		border: 0;
		border-top: 1px solid var(--hairline);
	}
</style>
