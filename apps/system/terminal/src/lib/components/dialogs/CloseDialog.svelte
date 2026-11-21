<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import type { CloseReview } from '#lib/workspace/workspace.svelte.js';

	interface Props {
		review: CloseReview;
		onclose: () => void;
	}

	let { review, onclose }: Props = $props();

	let programs = $derived(new Intl.ListFormat(i18n.formats, { type: 'unit' }).format(review.programs));
	let description = $derived(t('terminal-close-description', { count: review.programs.length, programs }));

	function close() {
		const { close } = review;
		onclose();
		close();
	}
</script>

<Dialog title={t('terminal-close-title')} {description} {onclose}>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('terminal-close-cancel')}</button>
		<button type="button" class="button danger" onclick={close}>{t('terminal-close-confirm')}</button>
	{/snippet}
</Dialog>
