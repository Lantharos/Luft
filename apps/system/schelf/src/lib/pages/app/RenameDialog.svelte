<script lang="ts">
	import { t } from '@luft/i18n';
	import { untrack } from 'svelte';
	import { Dialog, errorText, TextField } from '@luft/ui';
	import { commands, type Names } from '#lib/bindings.js';

	let { desktop, names, onclose }: { desktop: string; names: Names; onclose: (renamed: boolean) => void } = $props();

	let name = $state(untrack(() => names.custom ?? names.own));
	let busy = $state(false);
	let error = $state('');

	async function save() {
		busy = true;
		error = '';
		try {
			await commands.libraryRename({ desktop, name: name.trim() === names.own ? '' : name });
			onclose(true);
		} catch (reason) {
			error = errorText(reason);
			busy = false;
		}
	}
</script>

<Dialog title={t('app-rename-title', { name: names.custom ?? names.own })} description={t('app-rename-description', { name: names.own })} onclose={() => onclose(false)}>
	<TextField label={t('app-name')} bind:value={name} placeholder={names.own} {error} live disabled={busy} onkeydown={(event) => event.key === 'Enter' && save()} />
	{#snippet actions()}
		<button type="button" class="button" onclick={() => onclose(false)}>{t('app-rename-cancel')}</button>
		<button type="button" class="button primary" disabled={busy} onclick={save}>{t('app-rename')}</button>
	{/snippet}
</Dialog>
