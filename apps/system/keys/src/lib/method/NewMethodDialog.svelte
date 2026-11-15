<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, TextField } from '@luft/ui';
	import { toast } from '#lib/state/toast.svelte.js';
	import { commands } from '#lib/bindings.js';
	import type { SavedMethod } from '#lib/bindings.js';

	interface Props {
		oncreated: (method: SavedMethod) => void;
		onclose: () => void;
	}

	let { oncreated, onclose }: Props = $props();

	let name = $state('');
	let busy = $state(false);

	async function run(task: () => Promise<SavedMethod | null>) {
		if (busy) return;
		busy = true;
		try {
			const method = await task();
			if (method) oncreated(method);
		} catch (error) {
			toast.fail(error);
		} finally {
			busy = false;
		}
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && name.trim()) void run(() => commands.methodCreate({ name }));
	}
</script>

<Dialog title={t('keys-new-method')} {onclose}>
	<TextField label={t('keys-name')} showLabel bind:value={name} placeholder={t('keys-new-method-placeholder')} onkeydown={keydown} />
	{#snippet actions()}
		<button type="button" class="plain-button mr-auto" onclick={() => void run(() => commands.methodImport())}>{t('keys-import-file')}</button>
		<button type="button" class="button" onclick={onclose}>{t('keys-cancel')}</button>
		<button type="button" class="button primary" disabled={!name.trim() || busy} onclick={() => void run(() => commands.methodCreate({ name }))}>{t('keys-create')}</button>
	{/snippet}
</Dialog>
