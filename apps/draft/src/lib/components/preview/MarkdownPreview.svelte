<script lang="ts">
	import { renderMarkdown } from '@luft/ui';
	import { highlight } from '@luft/ui/code';
	import { useApp } from '#lib/context.js';
	import { openPath } from '#lib/documents/opening.js';
	import { dirname, join } from '#lib/utils/paths.js';

	const app = useApp();
	let workspace = $derived(app.workspace);

	const RENDER_DELAY_MS = 120;
	const WEB_LINK = /^(https?:|mailto:)/i;

	let html = $state('');
	let container = $state<HTMLElement>();
	const highlighted = new Map<string, string>();

	$effect(() => {
		void workspace.revision;
		const document = workspace.active;
		if (!document) return;
		const timer = setTimeout(async () => {
			html = await renderMarkdown(workspace.editor.state(document).doc.toString(), document.path);
		}, html ? RENDER_DELAY_MS : 0);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		void html;
		for (const block of container?.querySelectorAll<HTMLElement>('pre[data-language]') ?? []) void paint(block);
	});

	$effect(() => {
		const scroller = workspace.editor.view?.scrollDOM;
		if (!scroller) return;
		const follow = () => requestAnimationFrame(syncScroll);
		scroller.addEventListener('scroll', follow, { passive: true });
		return () => scroller.removeEventListener('scroll', follow);
	});

	async function paint(block: HTMLElement) {
		const language = block.dataset.language ?? '';
		const code = block.textContent ?? '';
		if (!language) return;
		const key = `${language}\n${code}`;
		const cached = highlighted.get(key) ?? (await highlight(code, language));
		highlighted.set(key, cached);
		if (block.isConnected) block.firstElementChild!.innerHTML = cached;
	}

	function syncScroll() {
		const view = workspace.editor.view;
		if (!view || !container) return;
		const top = view.state.doc.lineAt(workspace.editor.topPosition()).number;
		let target: HTMLElement | null = null;
		for (const element of container.querySelectorAll<HTMLElement>('[data-line]')) {
			if (Number(element.dataset.line) > top) break;
			target = element;
		}
		container.scrollTop = target ? target.offsetTop - 16 : 0;
	}

	function links(node: HTMLElement) {
		node.addEventListener('click', followLink);
		return () => node.removeEventListener('click', followLink);
	}

	function followLink(event: MouseEvent) {
		const anchor = (event.target as Element).closest('a');
		const href = anchor?.getAttribute('href');
		if (!href) return;
		event.preventDefault();
		if (WEB_LINK.test(href)) return void app.backend.openLink(href);
		if (href.startsWith('#')) return;
		const path = workspace.active?.path;
		if (path) void openPath(workspace, href.startsWith('/') ? href : join(dirname(path), decodeURI(href.split('#')[0])));
	}
</script>

<article bind:this={container} class="markdown soft-scroll" {@attach links}>
	{@html html}
</article>

<style>
	.markdown {
		min-width: 0;
		flex: 1;
		overflow-y: auto;
		padding: 18px 32px 40vh;
		box-shadow: inset 1px 0 0 var(--hairline);
		color: var(--text-soft);
		font-size: 14.5px;
		line-height: 1.7;
		user-select: text;
	}

	.markdown :global(> :first-child) {
		margin-top: 0;
	}

	.markdown :global(:is(h1, h2, h3, h4, h5, h6)) {
		margin: 1.6em 0 0.6em;
		color: var(--text);
		font-weight: 600;
		line-height: 1.3;
	}

	.markdown :global(h1) {
		font-size: 1.75em;
	}

	.markdown :global(h2) {
		font-size: 1.4em;
	}

	.markdown :global(h3) {
		font-size: 1.15em;
	}

	.markdown :global(:is(p, ul, ol, blockquote, pre, table)) {
		margin: 0 0 1em;
	}

	.markdown :global(:is(ul, ol)) {
		padding-left: 1.4em;
	}

	.markdown :global(ul) {
		list-style: disc;
	}

	.markdown :global(ol) {
		list-style: decimal;
	}

	.markdown :global(li + li) {
		margin-top: 0.25em;
	}

	.markdown :global(a) {
		color: var(--syntax-link);
		text-decoration: underline;
		text-decoration-color: color-mix(in oklab, currentColor 40%, transparent);
		text-underline-offset: 3px;
	}

	.markdown :global(strong) {
		color: var(--text);
		font-weight: 600;
	}

	.markdown :global(code) {
		border-radius: 6px;
		background: var(--surface-hover);
		padding: 0.1em 0.35em;
		font-family: var(--font-mono);
		font-size: 0.88em;
	}

	.markdown :global(pre) {
		overflow-x: auto;
		border-radius: 14px;
		background: var(--surface);
		padding: 14px 16px;
		line-height: 1.6;
	}

	.markdown :global(pre code) {
		background: none;
		padding: 0;
		color: var(--text);
	}

	.markdown :global(blockquote) {
		padding-left: 14px;
		box-shadow: inset 3px 0 0 var(--accent-line);
		color: var(--text-muted);
	}

	.markdown :global(hr) {
		margin: 2em 0;
		border: none;
		box-shadow: 0 1px 0 var(--hairline);
	}

	.markdown :global(table) {
		border-collapse: collapse;
		font-size: 0.92em;
	}

	.markdown :global(:is(th, td)) {
		padding: 6px 12px;
		box-shadow: inset 0 -1px 0 var(--hairline);
		text-align: left;
	}

	.markdown :global(th) {
		color: var(--text);
		font-weight: 600;
	}

	.markdown :global(img) {
		max-width: 100%;
		border-radius: 10px;
	}
</style>
