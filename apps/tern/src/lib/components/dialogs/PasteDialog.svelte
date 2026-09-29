<script lang="ts">
	import { Dialog } from '@luft/ui';
	import type { PasteReview } from '$lib/workspace/workspace.svelte';

	interface Props {
		review: PasteReview;
		onclose: () => void;
	}

	let { review, onclose }: Props = $props();

	function paste() {
		onclose();
		review.session.paste(review.text);
	}

	function cancel() {
		onclose();
		review.session.focus();
	}
</script>

<Dialog title="Paste this text?" wide onclose={cancel}>
	<ul class="flex flex-col gap-1 text-[13px] text-[var(--text-soft)]">
		{#each review.risks as risk (risk)}
			<li>{risk}</li>
		{/each}
	</ul>
	<pre class="paste-preview soft-scroll">{review.text}</pre>
	{#snippet actions()}
		<button type="button" class="button" onclick={cancel}>Cancel</button>
		<button type="button" class="button primary" onclick={paste}>Paste</button>
	{/snippet}
</Dialog>
