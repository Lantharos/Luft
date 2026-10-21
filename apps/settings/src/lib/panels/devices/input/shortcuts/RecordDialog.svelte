<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { typesText } from './accelerator';
	import KeyCapture from './KeyCapture.svelte';
	import type { Binding, ShortcutStore } from './store.svelte';

	interface Props {
		store: ShortcutStore;
		binding: Binding;
		onclose: () => void;
	}

	let { store, binding, onclose }: Props = $props();

	let recording = $state(true);
	let pending = $state<string | null>(null);
	let taken = $state<Binding | null>(null);
	let error = $state('');

	async function apply(accelerators: string[]) {
		try {
			await store.assign(binding, accelerators);
			onclose();
		} catch (reason) {
			error = String(reason);
		}
	}

	function capture(accelerator: string | null) {
		error = '';
		if (accelerator === null) return apply([]);
		if (typesText(accelerator)) {
			error = t('settings-shortcuts-needs-modifier');
			recording = true;
			return;
		}
		const other = store.conflict(accelerator, binding);
		if (!other) return apply([accelerator]);
		pending = accelerator;
		taken = other;
	}

	async function replace() {
		if (!pending || !taken) return;
		await store.release(pending, taken);
		await apply([pending]);
	}

	function retry() {
		pending = null;
		taken = null;
		recording = true;
	}
</script>

<Dialog title={binding.name} description={t('settings-shortcuts-record-description')} {onclose}>
	<KeyCapture accelerators={pending ? [pending] : binding.accelerators} bind:recording oncapture={capture} oncancel={onclose} />
	{#if taken}
		<p class="text-[13px] leading-relaxed text-[var(--text-soft)]">
			{t('settings-shortcuts-record-taken', { name: taken.name })}
		</p>
	{/if}
	{#if error}
		<p class="text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		{#if taken}
			<button type="button" class="button" onclick={retry}>{t('settings-shortcuts-try-another')}</button>
			<button type="button" class="button primary" onclick={replace}>{t('settings-shortcuts-replace')}</button>
		{:else}
			<button type="button" class="button" onclick={onclose}>{t('settings-shortcuts-cancel')}</button>
		{/if}
	{/snippet}
</Dialog>
