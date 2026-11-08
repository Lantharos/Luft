<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Dialog, TextField } from '@luft/ui';
	import { focusField } from './focus';

	let {
		title,
		label,
		action,
		value: initial = '',
		onsave,
		onclose
	}: { title: string; label: string; action: string; value?: string; onsave: (value: string) => void | Promise<void>; onclose: () => void } = $props();

	let value = $state(untrack(() => initial));
	let trimmed = $derived(value.trim());

	async function save() {
		if (!trimmed) return;
		await onsave(trimmed);
		onclose();
	}
</script>

<Dialog {title} {onclose}>
	<form id="name-dialog" {@attach focusField} onsubmit={(event) => (event.preventDefault(), void save())}>
		<TextField bind:value {label} placeholder={label} />
	</form>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="submit" form="name-dialog" class="button primary" disabled={!trimmed}>{action}</button>
	{/snippet}
</Dialog>
