<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Row, Section } from '@luft/ui';
	import AccessList from '#lib/components/AccessList.svelte';
	import Description from '#lib/components/Description.svelte';
	import type { FileInstall } from './install.svelte.js';

	let { install }: { install: FileInstall } = $props();

	const file = $derived(install.file!);
	const source = $derived(install.source);
	const sourceName = $derived(install.sourceName);
</script>

{#if install.permissions}
	<AccessList permissions={install.permissions} />
{/if}

{#if (file.kind === 'package' || file.kind === 'deb') && file.description}
	<Description html={`<p>${file.description.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`} />
{/if}

<Section title={t('file-details')}>
	{#if install.publisher}
		<Row title={t('file-made-by')}><span class="max-w-[320px] truncate">{install.publisher}</span></Row>
	{/if}
	{#if file.kind === 'package' || file.kind === 'appImage' || file.kind === 'deb'}
		{#if file.version}
			<Row title={t('file-version')}><span>{file.version}</span></Row>
		{/if}
		<Row title={t('file-size')}><span>{bytes(file.size)}</span></Row>
	{/if}
	{#if file.kind === 'package'}
		<Row title={t('file-license')}><span class="max-w-[320px] truncate">{file.license}</span></Row>
	{/if}
	{#if file.kind === 'flatpakRef' || file.kind === 'flatpakRepo'}
		<Row title={t('file-source')} description={file.url}><span>{new URL(file.url).host}</span></Row>
	{/if}
	{#if file.kind === 'flatpakBundle'}
		<Row title={t('file-size')}><span>{bytes(file.size)}</span></Row>
		{#if file.runtime}
			<Row title={t('file-needs')} description={t('file-needs-description')}><span class="max-w-[320px] truncate">{file.runtime.split('/')[0]}</span></Row>
		{/if}
		{#if file.origin}
			<Row title={t('file-updates-from')} description={file.origin}><span>{new URL(file.origin).host}</span></Row>
		{:else}
			<Row title={t('file-updates')} description={t('file-updates-bundle')} />
		{/if}
	{/if}
	{#if file.kind === 'deb'}
		<Row
			title={t('file-installs-to')}
			description={t('file-installs-to-ubuntu')}
		/>
		<Row title={t('file-updates')} description={t('file-updates-deb')} />
	{/if}
	{#if file.kind === 'appImage'}
		<Row title={t('file-installs-to')} description={t('file-installs-to-appimage')}><span>{t('file-your-account')}</span></Row>
	{:else if file.kind === 'package' && file.system}
		<Row title={t('file-installs-to')} description={t('file-installs-to-system')}><span>{t('file-system')}</span></Row>
		{#if source && sourceName}
			<Row title={t('file-updates-from')} description={source.described.sources[0]?.url}><span class="max-w-[320px] truncate">{sourceName}</span></Row>
		{/if}
	{:else if file.kind === 'package'}
		<Row title={t('file-installs-to')} description={t('file-installs-to-tool')}><span>{t('file-your-account')}</span></Row>
	{/if}
	<Row title={t('file-file')} description={install.path} />
</Section>

{#if file.kind === 'package' && source}
	<p class="px-2 text-[13px] text-[var(--text-muted)]">
		{t('file-source-updates', { name: file.package, source: sourceName ?? '' })}
		{source.added ? t('file-source-added') : t('file-source-adds')}
	</p>
{:else if file.kind === 'package' && file.repositoryError}
	<p class="px-2 text-[13px] text-[var(--text-muted)]">
		{t('file-source-unusable')}
		{file.repositoryError}
	</p>
{/if}
