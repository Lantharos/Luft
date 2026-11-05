<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import Info from '@lucide/svelte/icons/circle-help';
	import { t } from '@luft/i18n';
	import { IconButton, bytes, fileDragStart } from '@luft/ui';
	import type { Family } from '#lib/bindings.js';
	import Adjust from '#lib/edit/Adjust.svelte';
	import EditView from '#lib/edit/EditView.svelte';
	import FileList from '#lib/convert/FileList.svelte';
	import FormatPicker from '#lib/convert/FormatPicker.svelte';
	import OptionsPanel from '#lib/convert/OptionsPanel.svelte';
	import OutputOptions from '#lib/convert/OutputOptions.svelte';
	import PresetMenu from '#lib/convert/PresetMenu.svelte';
	import Toggle from '#lib/convert/fields/Toggle.svelte';
	import { editor } from '#lib/state/editor.svelte.js';
	import { session } from '#lib/state/session.svelte.js';

	const single = $derived(session.files.length === 1);
	const first = $derived<Family | undefined>(session.families[0]);
	const file = $derived(session.current);
	const packable = $derived(session.files.length > 1 || session.roots.length > 1);
	const editing = $derived(session.view === 'edit');
	const combinable = $derived(session.files.filter((item) => session.targetOf(item) === 'pdf').length > 1);

	$effect(() => {
		if (single && file) void editor.open(file);
	});
</script>

<div class="flex min-h-0 flex-1 gap-0">
	{#if session.view === 'edit' && file}
		<EditView />
	{:else if single && file}
		<section class="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 px-6 pb-6" aria-label={file.name}>
			{#if editor.preview}
				<img class="preview" src={fileUrl(editor.preview.path)} alt={file.name} draggable="true" ondragstart={fileDragStart(file.path)} />
			{/if}
			<p class="text-center text-[13px] text-[var(--text-muted)]">{file.label ?? t('list-unknown')} · {bytes(file.size)}</p>
		</section>
	{:else}
		<FileList />
	{/if}
	<aside class="panel" aria-label={t('panel-label')}>
		<div class="settings soft-scroll">
			{#if editing && editor.visual}
				<section class="flex flex-col gap-3">
					<h2 class="text-[13px] font-semibold text-[var(--text-soft)]">{t('adjust-title')}</h2>
					<Adjust />
				</section>
			{/if}
			{#each session.families as family (family)}
				<FormatPicker {family} titled={session.families.length > 1} />
				{#if file && !editing}
					<OptionsPanel {family} file={session.files.find((item) => item.family === family) ?? file} />
				{/if}
			{/each}
			{#if session.unknown.length}
				<p class="text-[12px] leading-[1.4] text-[var(--text-muted)]">{t('panel-unknown', { count: session.unknown.length })}</p>
			{/if}
			{#if packable}
				<section class="flex flex-col gap-2">
					<h2 class="text-[13px] font-semibold text-[var(--text-soft)]">{t('pack-title')}</h2>
					<div class="flex flex-wrap gap-1.5">
						{#each session.archiveTargets.slice(0, 3) as target (target.id)}
							<button type="button" class="pack" class:chosen={session.pack === target.id} aria-pressed={session.pack === target.id} onclick={() => (session.pack = session.pack === target.id ? null : target.id)}>
								{target.label}
							</button>
						{/each}
					</div>
				</section>
			{/if}
			{#if combinable}
				<Toggle label={t('combine-pdf')} checked={session.combine} onchange={(value) => (session.combine = value)} />
			{/if}
		</div>
		<div class="flex flex-col gap-3 px-3.5 pb-3.5 pt-2">
			{#if !editing}
				<OutputOptions />
			{/if}
			<div class="flex items-center gap-1">
				<button type="button" class="button primary flex-1" disabled={!session.jobs} onclick={() => session.convert()}>
					{session.jobs > 1 ? t('action-convert-many', { count: session.jobs }) : t('action-convert')}
				</button>
				{#if first}
					<PresetMenu family={first} />
				{/if}
				<IconButton icon={Info} label={t('unsupported-open')} onclick={() => (session.showUnsupported = true)} />
			</div>
		</div>
	</aside>
</div>

<style>
	.panel {
		display: flex;
		flex: 0 0 320px;
		flex-direction: column;
		min-height: 0;
	}

	.settings {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 18px;
		min-height: 0;
		overflow: hidden auto;
		padding: 4px 14px 8px;
	}

	.preview {
		min-height: 0;
		max-width: 100%;
		max-height: calc(100% - 28px);
		border-radius: 8px;
		object-fit: contain;
	}

	.pack {
		min-height: 32px;
		padding: 0 12px;
		border-radius: var(--radius-pill);
		background: var(--surface);
		font-size: 13px;
		font-weight: 500;
	}

	.pack.chosen {
		background: var(--accent);
		color: var(--accent-text);
	}
</style>
