<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, TextField } from '@luft/ui';
	import { untrack } from 'svelte';

	interface Props {
		name: string;
		computer: string;
		onsave: (name: string) => void;
		onclose: () => void;
	}

	let { name, computer, onsave, onclose }: Props = $props();

	let draft = $state(untrack(() => name));

	function save() {
		onsave(draft.trim());
		onclose();
	}
</script>

<Dialog title={t('settings-post-name')} description={t('settings-post-name.description')} {onclose}>
	<TextField label={t('settings-post-name')} bind:value={draft} placeholder={computer} onkeydown={(event) => event.key === 'Enter' && save()} />
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('settings-post-cancel')}</button>
		<button type="button" class="button primary" onclick={save}>{t('settings-post-save')}</button>
	{/snippet}
</Dialog>
