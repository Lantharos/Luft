<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog, errorText, Row } from '@luft/ui';
	import { commands, type GivenDrive, type InstalledApp, type Places, type PluggedDrive } from '#lib/bindings.js';
	import { SLOW } from '#lib/bridge/index.js';
	import GiveDrive from './GiveDrive.svelte';

	let { app }: { app: InstalledApp } = $props();

	let places = $state<Places>({ drives: [], folders: [] });
	let open = $state(false);
	let giving = $state(false);
	let busy = $state(false);
	let problem = $state('');
	let running = $state(false);

	const driveName = (drive: GivenDrive | PluggedDrive) => drive.label || t('app-places-drive-unnamed', { size: bytes(drive.size) });
	const summary = $derived(
		[...places.drives.map(driveName), ...places.folders.map((folder) => folder.path.split('/').pop() || folder.path)].join(', ') ||
			t('app-places-none')
	);

	function read() {
		void commands.libraryPlaces({ id: app.id }).then((given) => (places = given));
	}

	$effect(read);

	async function change(work: () => Promise<boolean | null | void>) {
		busy = true;
		problem = '';
		try {
			running = (await work()) === true || running;
			read();
		} catch (reason) {
			problem = errorText(reason);
		} finally {
			busy = false;
		}
	}

	const give = (drive: PluggedDrive, readOnly: boolean) => {
		giving = false;
		return change(() => commands.libraryGiveDrive({ app: app.id, uuid: drive.uuid, drive: drive.drive, readOnly }, SLOW));
	};

	async function restart(desktop: string) {
		await change(() => commands.libraryRestart({ id: app.id, desktop, token: null }, SLOW));
		running = false;
	}
</script>

<Row title={t('app-places')} description={summary}>
	<button type="button" class="button" onclick={() => (open = true)}>{t('app-sandbox-change')}</button>
</Row>

{#if open}
	<Dialog title={t('app-places-title', { name: app.name })} wide onclose={() => (open = false)}>
		<div class="flex flex-col">
			<Row title={t('app-places-drives')} description={t('app-places-drives-description')}>
				<button type="button" class="button" disabled={busy} onclick={() => (giving = true)}>{t('app-places-give-drive')}</button>
			</Row>
			{#each places.drives as drive (`${drive.uuid} ${drive.drive}`)}
				<Row title={driveName(drive)} description={!drive.pluggedIn ? t('app-places-unplugged') : drive.readOnly ? t('app-places-read-only') : undefined} truncate>
					<button
						type="button"
						class="button"
						aria-label={t('app-places-stop-sharing', { place: driveName(drive) })}
						disabled={busy}
						onclick={() => change(() => commands.libraryTakeDrive({ app: app.id, uuid: drive.uuid, drive: drive.drive }, SLOW))}
					>
						{t('app-places-remove')}
					</button>
				</Row>
			{/each}
			<Row title={t('app-places-folders')} description={t('app-places-folders-description')}>
				<button type="button" class="button" disabled={busy} onclick={() => change(() => commands.libraryAddFolder({ id: app.id }, SLOW))}>
					{t('app-places-add-folder')}
				</button>
			</Row>
			{#each places.folders as folder (folder.path)}
				<Row title={folder.path} description={folder.readOnly ? t('app-places-read-only') : undefined} truncate>
					<button
						type="button"
						class="button"
						aria-label={t('app-places-stop-sharing', { place: folder.path })}
						disabled={busy}
						onclick={() => change(() => commands.libraryRemoveFolder({ id: app.id, folder: folder.path }, SLOW))}
					>
						{t('app-places-remove')}
					</button>
				</Row>
			{/each}
			{#if problem}
				<p class="px-4 pt-2 text-[13px] text-[var(--danger)]">{problem}</p>
			{/if}
		</div>
		{#snippet actions()}
			{#if running && app.desktop}
				{@const desktop = app.desktop}
				<button type="button" class="button" disabled={busy} onclick={() => restart(desktop)}>{t('app-restart-named', { name: app.name })}</button>
			{/if}
			<button type="button" class="button primary" onclick={() => (open = false)}>{t('app-done')}</button>
		{/snippet}
	</Dialog>
{/if}

{#if giving}
	<GiveDrive {app} ongive={give} onclose={() => (giving = false)} />
{/if}
