<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog, Row, Section, Switch, TextField } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { binaryBytes } from '#lib/format.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { about, openDisks, otherSystems, removeSystem, rename, type About, type OtherSystem } from './api';
	import RecentProblems from './RecentProblems.svelte';

	let { onclose }: { onclose: () => void } = $props();

	const drives = useSettings<{ 'mount-internal': boolean }>('com.lantharos.kestrel.drives', ['mount-internal']);

	let info = $state<About | null>(null);
	let others = $state<OtherSystem[]>([]);
	let renaming = $state(false);
	let draft = $state('');
	let error = $state('');

	async function load() {
		info = await about();
	}

	async function saveName() {
		try {
			await rename(draft);
			renaming = false;
			await load();
		} catch (reason) {
			error = String(reason);
		}
	}

	function startRename() {
		draft = info?.deviceName ?? '';
		error = '';
		renaming = true;
	}

	function describe(system: OtherSystem) {
		if (system.kind === 'old-system') return t('settings-about-old-system', { size: bytes(system.size) });
		return t('settings-about-other-system', { size: bytes(system.size) });
	}

	void load();
	otherSystems().then((list) => (others = list));
</script>

<SubPage title={t('settings-page-about')} back={t('settings-page-system')} {onclose}>
	{#if info}
		<div class="flex flex-col gap-1 px-2 pb-2">
			<span class="truncate text-[26px] font-semibold">{info.deviceName}</span>
			<span class="truncate text-[14px] text-[var(--text-muted)]">{info.system}</span>
		</div>

		<Section>
			<Row title={t('settings-about-device-name')} description={t('settings-about-device-name-description')}>
				<span class="max-w-[220px] truncate">{info.deviceName}</span>
				<button type="button" class="button" onclick={startRename}>{t('settings-about-rename')}</button>
			</Row>
		</Section>

		<Section title={t('settings-about-hardware')}>
			{#if info.processor}
				<Row title={t('settings-about-processor')}><span class="value">{info.processor}</span></Row>
			{/if}
			{#each info.graphics as adapter, index (adapter)}
				<Row title={info.graphics.length > 1 ? t('settings-about-graphics-numbered', { number: index + 1 }) : t('settings-about-graphics')}><span class="value">{adapter}</span></Row>
			{/each}
			{#if info.memory}
				<Row title={t('settings-about-memory')}><span>{binaryBytes(info.memory)}</span></Row>
			{/if}
			{#if info.storage}
				{@const storage = info.storage}
				<Row title={t('settings-about-storage')} description={t('settings-about-storage-free', { free: bytes(storage.free), total: bytes(storage.total) })}>
					{#if storage.manageable}
						<button type="button" class="button" onclick={openDisks}>{t('settings-about-manage-drives')}</button>
					{/if}
					{#snippet below()}
						<div class="h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
							<div class="h-full rounded-full bg-[var(--accent)]" style:width="{((storage.total - storage.free) / storage.total) * 100}%"></div>
						</div>
					{/snippet}
				</Row>
			{/if}
			<Switch
				label={t('settings-about-mount-internal')}
				checked={drives.values['mount-internal'] ?? true}
				onchange={(on) => drives.set('mount-internal', on)}
			/>
			{#each others as system (system.id)}
				<Row title={system.name} description={describe(system)}>
					<button type="button" class="button" onclick={() => removeSystem(system.id)}>{t('settings-about-remove')}</button>
				</Row>
			{/each}
		</Section>

		<Section title={t('settings-about-software')}>
			<Row title={t('settings-about-system')}><span class="value">{info.system}</span></Row>
			<Row title={t('settings-about-desktop')}><span class="value">Kestrel</span></Row>
			<Row title={t('settings-about-kernel')}><span class="value">{info.kernel}</span></Row>
			<Row title={t('settings-about-hostname')}><span class="value">{info.hostname}</span></Row>
		</Section>

		<RecentProblems />
	{/if}
</SubPage>

{#if renaming}
	<Dialog title={t('settings-about-rename-title')} description={t('settings-about-rename-description')} onclose={() => (renaming = false)}>
		<TextField label={t('settings-about-device-name')} bind:value={draft} {error} live onkeydown={(event) => event.key === 'Enter' && draft.trim() && saveName()} />
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (renaming = false)}>{t('settings-about-cancel')}</button>
			<button type="button" class="button primary" disabled={!draft.trim()} onclick={saveName}>{t('settings-about-rename')}</button>
		{/snippet}
	</Dialog>
{/if}

<style>
	.value {
		max-width: 400px;
		overflow: hidden;
		text-align: right;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
