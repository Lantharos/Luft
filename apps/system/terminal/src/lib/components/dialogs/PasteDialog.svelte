<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import type { PasteReview } from '#lib/workspace/workspace.svelte.js';

	interface Props {
		review: PasteReview;
		onclose: () => void;
	}

	let { review, onclose }: Props = $props();

	function paste() {
		const { session, text } = review;
		onclose();
		session.paste(text);
	}

	function cancel() {
		const { session } = review;
		onclose();
		session.focus();
	}
</script>

<Dialog title={t('terminal-paste-title')} wide onclose={cancel}>
	<ul class="flex flex-col gap-1 text-[13px] text-[var(--text-soft)]">
		{#each review.risks as risk (risk)}
			<li>{risk}</li>
		{/each}
	</ul>
	<pre class="paste-preview">{review.text}</pre>
	{#snippet actions()}
		<button type="button" class="button" onclick={cancel}>{t('terminal-paste-cancel')}</button>
		<button type="button" class="button primary" onclick={paste}>{t('terminal-paste-confirm')}</button>
	{/snippet}
</Dialog>
