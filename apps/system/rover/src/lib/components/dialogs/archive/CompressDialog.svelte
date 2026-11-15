<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { t } from '@luft/i18n';
	import { Dialog, errorText, Segmented, TextField } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { ArchiveFormat, FileEntry } from '#lib/bindings.js';
	import { archiveName } from '#lib/features/archives.js';

	interface Props {
		entries: FileEntry[];
		destination: string;
		onclose: () => void;
	}

	let { entries, destination, onclose }: Props = $props();

	const FORMATS: { value: ArchiveFormat; label: string }[] = [
		{ value: 'zip', label: 'Zip' },
		{ value: 'tar-zst', label: 'tar.zst' }
	];

	let field = $state<{ focus: () => void }>();
	let name = $state(untrack(() => archiveName(entries)));
	let format = $state<ArchiveFormat>('zip');
	let error = $state<string | null>(null);

	let hint = $derived(
		format === 'zip' ? t('rover-compress-zip-hint') : t('rover-compress-tar-hint')
	);
	let valid = $derived(name.trim().length > 0 && !name.includes('/'));

	$effect(() => {
		void tick().then(() => field?.focus());
	});

	async function submit() {
		if (!valid) return;
		try {
			await commands.compressItems({ paths: entries.map((entry) => entry.path), destination, name: name.trim(), format });
			onclose();
		} catch (caught) {
			error = errorText(caught);
		}
	}
</script>

<Dialog title={entries.length === 1 ? t('rover-compress-title-one', { name: entries[0].name }) : t('rover-compress-title', { count: entries.length })} {onclose}>
	<TextField
		bind:this={field}
		label={t('rover-compress-name')}
		placeholder={t('rover-compress-name')}
		bind:value={name}
		invalid={!valid}
		onkeydown={(event) => event.key === 'Enter' && void submit()}
	/>
	<div class="flex flex-col gap-2">
		<Segmented label={t('rover-compress-format')} options={FORMATS} value={format} onchange={(value) => (format = value)} />
		<p class="px-1 text-[12px] text-[var(--text-muted)]">{hint}</p>
	</div>
	{#if error}
		<p class="text-[12px] text-[var(--danger)]">{error}</p>
	{/if}

	{#snippet actions()}
		<button class="button" type="button" onclick={onclose}>{t('rover-cancel')}</button>
		<button class="button primary" type="button" disabled={!valid} onclick={submit}>{t('rover-compress-confirm')}</button>

	{/snippet}
</Dialog>
