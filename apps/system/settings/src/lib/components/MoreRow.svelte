<script lang="ts" module>
	export const COLLAPSED = 5;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { t } from '@luft/i18n';
	import { Dialog, Row } from '@luft/ui';

	interface Props {
		hidden: number;
		title: string;
		children: Snippet<[close: () => void]>;
	}

	let { hidden, title, children }: Props = $props();

	let open = $state(false);

	const close = () => (open = false);
</script>

<Row title={t('settings-more-show', { count: hidden })} onclick={() => (open = true)} />

{#if open}
	<Dialog {title} wide onclose={close}>
		<div class="row-group">{@render children(close)}</div>
		{#snippet actions()}
			<button type="button" class="button primary" onclick={close}>{t('settings-more-done')}</button>
		{/snippet}
	</Dialog>
{/if}
