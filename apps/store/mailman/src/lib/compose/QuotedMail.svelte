<script lang="ts">
	import { quoteStylesheet, showFiles, SKELETON } from '#lib/reader/body.js';

	interface Props {
		html: string;
	}

	let { html }: Props = $props();

	let frame = $state<HTMLIFrameElement>();

	$effect(() => {
		if (!frame) return;
		const shown = frame;
		const page = shown.contentDocument!;
		page.open();
		page.write(SKELETON);
		page.close();
		const style = page.createElement('style');
		style.textContent = quoteStylesheet(shown);
		const body = page.createElement('div');
		body.className = 'mm-root';
		body.innerHTML = html;
		page.head.append(style);
		page.body.append(body);
		page.addEventListener('click', (event) => event.preventDefault());
		showFiles(body);
		const resizes = new ResizeObserver(() => (shown.style.height = `${page.documentElement.offsetHeight}px`));
		resizes.observe(page.documentElement);
		return () => resizes.disconnect();
	});
</script>

<iframe bind:this={frame} class="quoted-mail" title="Quoted text" sandbox="allow-same-origin"></iframe>

<style>
	.quoted-mail {
		display: block;
		width: 100%;
		height: 0;
		border: 0;
	}
</style>
