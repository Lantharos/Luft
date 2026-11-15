<script lang="ts">
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

<Section title="Details">
	{#if install.publisher}
		<Row title="Made by"><span class="max-w-[320px] truncate">{install.publisher}</span></Row>
	{/if}
	{#if file.kind === 'package' || file.kind === 'appImage' || file.kind === 'deb'}
		{#if file.version}
			<Row title="Version"><span>{file.version}</span></Row>
		{/if}
		<Row title="Size"><span>{bytes(file.size)}</span></Row>
	{/if}
	{#if file.kind === 'package'}
		<Row title="License"><span class="max-w-[320px] truncate">{file.license}</span></Row>
	{/if}
	{#if file.kind === 'flatpakRef' || file.kind === 'flatpakRepo'}
		<Row title="Source" description={file.url}><span>{new URL(file.url).host}</span></Row>
	{/if}
	{#if file.kind === 'flatpakBundle'}
		<Row title="Size"><span>{bytes(file.size)}</span></Row>
		{#if file.runtime}
			<Row title="Needs" description="Installed from Flathub along with it."><span class="max-w-[320px] truncate">{file.runtime.split('/')[0]}</span></Row>
		{/if}
		{#if file.origin}
			<Row title="Updates from" description={file.origin}><span>{new URL(file.origin).host}</span></Row>
		{:else}
			<Row title="Updates" description="Install a newer file when one comes out." />
		{/if}
	{/if}
	{#if file.kind === 'deb'}
		<Row
			title="Installs to"
			description="A separate space with Ubuntu's software that can read and change your files. The first one downloads Ubuntu, a few hundred megabytes."
		/>
		<Row title="Updates" description="From its maker's software source if it adds one. Otherwise, install a newer file." />
	{/if}
	{#if file.kind === 'appImage'}
		<Row title="Installs to" description="Kept up to date when Schelf can."><span>Your account</span></Row>
	{:else if file.kind === 'package' && file.system}
		<Row title="Installs to" description="For everyone on this computer, updated with Luft."><span>System</span></Row>
		{#if source && sourceName}
			<Row title="Updates from" description={source.described.sources[0]?.url}><span class="max-w-[320px] truncate">{sourceName}</span></Row>
		{/if}
	{:else if file.kind === 'package'}
		<Row title="Installs to" description="For you only. Its commands run in Tern."><span>Your account</span></Row>
	{/if}
	<Row title="File" description={install.path} />
</Section>

{#if file.kind === 'package' && source}
	<p class="px-2 text-[13px] text-[var(--text-muted)]">
		{file.package} installs from {sourceName}, so it keeps getting updates. {source.added
			? "It's one of your software sources already."
			: 'Installing adds it to your software sources.'}
	</p>
{:else if file.kind === 'package' && file.repositoryError}
	<p class="px-2 text-[13px] text-[var(--text-muted)]">
		It brings a software source Luft can't use, so it installs by itself and won't get updates. {file.repositoryError}
	</p>
{/if}
