<script lang="ts">
	import { errorText } from '../text/errors';
	import { t } from '@luft/i18n';
	import Dialog from './Dialog.svelte';

	interface Props {
		title: string;
		description: string;
		action: string;
		danger?: boolean;
		run: () => Promise<boolean | void>;
		onclose: () => void;
	}

	let { title, description, action, danger = false, run, onclose }: Props = $props();

	let busy = $state(false);
	let error = $state('');

	async function confirm() {
		busy = true;
		error = '';
		try {
			if ((await run()) !== false) return onclose();
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}
</script>

<Dialog {title} {description} onclose={() => !busy && onclose()}>
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" disabled={busy} onclick={onclose}>{t('ui-dialog-cancel')}</button>
		<button type="button" class="button {danger ? 'danger' : 'primary'}" disabled={busy} onclick={confirm}>{action}</button>
	{/snippet}
</Dialog>
