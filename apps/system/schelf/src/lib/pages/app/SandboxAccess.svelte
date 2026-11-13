<script lang="ts">
	import { Dialog, errorText, Row, Switch } from '@luft/ui';
	import { commands, type InstalledApp, type Permissions, type Switch as SandboxSwitch } from '#lib/bindings.js';
	import { SLOW } from '#lib/bridge/index.js';

	let {
		app,
		permissions,
		open = $bindable(false),
		onchange
	}: { app: InstalledApp; permissions: Permissions; open?: boolean; onchange: () => void } = $props();

	let busy = $state(false);
	let problem = $state('');
	let running = $state(false);

	const downloads = $derived(permissions.filesystems.some((place) => ['xdg-download', 'home', 'host'].includes(place)));
	const x11 = $derived(permissions.sockets.includes('x11'));
	const microphone = $derived(permissions.devices.includes('microphone'));
	const camera = $derived(permissions.devices.includes('camera'));

	async function change(change: SandboxSwitch, on: boolean) {
		busy = true;
		problem = '';
		try {
			const open = await commands.librarySetSandboxSwitch({ id: app.id, switch: change, on }, SLOW);
			if (change !== 'microphone') running = open;
			onchange();
		} catch (reason) {
			problem = errorText(reason);
		} finally {
			busy = false;
		}
	}

	async function restart(desktop: string) {
		busy = true;
		problem = '';
		try {
			await commands.libraryRestart({ id: app.id, desktop, token: null }, SLOW);
			running = false;
		} catch (reason) {
			problem = errorText(reason);
		} finally {
			busy = false;
		}
	}
</script>

<Row title="Change what it can use" description="Microphone, camera, Downloads and X11. More in Settings, under Apps.">
	<button type="button" class="button" onclick={() => (open = true)}>Change</button>
</Row>

{#if open}
	<Dialog title="What {app.name} can use" wide onclose={() => (open = false)}>
		<div class="flex flex-col">
			<Row title="Microphone" description="Records the microphone and what this computer plays. Applies right away.">
				<Switch label="Microphone" checked={microphone} disabled={busy} onchange={(on) => change('microphone', on)} />
			</Row>
			<Row title="Camera" description="Some apps only find it the next time they open.">
				<Switch label="Camera" checked={camera} disabled={busy} onchange={(on) => change('camera', on)} />
			</Row>
			<Row title="Downloads folder" description="It can read and change the files there, from the next time it opens. Files you pick always reach it.">
				<Switch label="Downloads folder" checked={downloads} disabled={busy} onchange={(on) => change('downloads', on)} />
			</Row>
			<Row
				title="Older way of showing windows"
				description="For older apps that need X11, where apps can see each other’s windows and typing. Applies the next time it opens."
			>
				<Switch label="Older way of showing windows" checked={x11} disabled={busy} onchange={(on) => change('x11', on)} />
			</Row>
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
