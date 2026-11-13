<script lang="ts">
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

	const driveName = (drive: GivenDrive | PluggedDrive) => drive.label || `${bytes(drive.size)} drive`;
	const summary = $derived(
		[...places.drives.map(driveName), ...places.folders.map((folder) => folder.path.split('/').pop() || folder.path)].join(', ') ||
			'A drive or a folder, without full access.'
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

<Row title="Drives and folders" description={summary}>
	<button type="button" class="button" onclick={() => (open = true)}>Change</button>
</Row>

{#if open}
	<Dialog title="Drives and folders {app.name} can use" wide onclose={() => (open = false)}>
		<div class="flex flex-col">
			<Row title="Drives" description="It can use everything on these drives, from the next time it opens.">
				<button type="button" class="button" disabled={busy} onclick={() => (giving = true)}>Give a drive</button>
			</Row>
			{#each places.drives as drive (`${drive.uuid} ${drive.drive}`)}
				<Row title={driveName(drive)} description={!drive.pluggedIn ? 'Not plugged in' : drive.readOnly ? 'Read only' : undefined} truncate>
					<button
						type="button"
						class="button"
						aria-label="Stop sharing {driveName(drive)}"
						disabled={busy}
						onclick={() => change(() => commands.libraryTakeDrive({ app: app.id, uuid: drive.uuid, drive: drive.drive }, SLOW))}
					>
						Remove
					</button>
				</Row>
			{/each}
			<Row title="Folders" description="It can read and change everything in these folders, from the next time it opens.">
				<button type="button" class="button" disabled={busy} onclick={() => change(() => commands.libraryAddFolder({ id: app.id }, SLOW))}>
					Add folder
				</button>
			</Row>
			{#each places.folders as folder (folder.path)}
				<Row title={folder.path} description={folder.readOnly ? 'Read only' : undefined} truncate>
					<button
						type="button"
						class="button"
						aria-label="Stop sharing {folder.path}"
						disabled={busy}
						onclick={() => change(() => commands.libraryRemoveFolder({ id: app.id, folder: folder.path }, SLOW))}
					>
						Remove
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
				<button type="button" class="button" disabled={busy} onclick={() => restart(desktop)}>Restart {app.name}</button>
			{/if}
			<button type="button" class="button primary" onclick={() => (open = false)}>Done</button>
		{/snippet}
	</Dialog>
{/if}

{#if giving}
	<GiveDrive {app} ongive={give} onclose={() => (giving = false)} />
{/if}
