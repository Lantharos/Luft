<script lang="ts">
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';
	import { Dialog, MenuButton, MenuItem, MenuSeparator, TextField } from '@luft/ui';
	import type { Family } from '#lib/bindings.js';
	import { session } from '#lib/state/session.svelte.js';

	interface Props {
		family: Family;
	}

	let { family }: Props = $props();

	let naming = $state(false);
	let name = $state('');

	const usable = $derived(session.presets.filter((preset) => session.files.some((file) => file.targets.some((target) => target.id === preset.format))));

	function save() {
		session.savePreset(name.trim(), family);
		naming = false;
		name = '';
	}
</script>

<MenuButton label={t('preset-menu')} class="icon-button" align="end" minWidth={220}>
	{#snippet trigger()}
		<Bookmark size={18} />
	{/snippet}
	{#snippet children(close)}
		{#each usable as preset (preset.name)}
			<div class="flex items-center">
				<div class="min-w-0 flex-1">
					<MenuItem onclick={() => { session.applyPreset(preset); close(); }}>{preset.name}</MenuItem>
				</div>
				<button type="button" class="icon-button" aria-label={t('preset-delete', { name: preset.name })} onclick={() => session.deletePreset(preset.name)}>
					<X size={15} />
				</button>
			</div>
		{/each}
		{#if usable.length}
			<MenuSeparator />
		{/if}
		<MenuItem disabled={!session.choices[family]} onclick={() => { naming = true; close(); }}>{t('preset-save')}</MenuItem>
	{/snippet}
</MenuButton>

{#if naming}
	<Dialog title={t('preset-save')} onclose={() => (naming = false)}>
		<TextField label={t('preset-name')} showLabel bind:value={name} />
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (naming = false)}>{t('action-cancel')}</button>
			<button type="button" class="button primary" disabled={!name.trim()} onclick={save}>{t('action-save')}</button>
		{/snippet}
	</Dialog>
{/if}
