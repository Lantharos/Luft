<script lang="ts">
	import { t } from '@luft/i18n';
	import { basename, Dialog } from '@luft/ui';

	interface Props {
		clashes: string[];
		onreplace: () => void;
		onclose: () => void;
	}

	let { clashes, onreplace, onclose }: Props = $props();

	let names = $derived(clashes.map((path) => basename(path)));
</script>

<Dialog
	title={t('rover-chooser-replace-title', { count: names.length, name: names[0] })}
	description={t('rover-chooser-replace-description', { count: names.length, names: names.join(', ') })}
	{onclose}
>
	{#snippet actions()}
		<button class="button" type="button" onclick={onclose}>{t('rover-cancel')}</button>
		<button class="button danger" type="button" onclick={onreplace}>{t('rover-chooser-replace')}</button>
	{/snippet}
</Dialog>
