<script lang="ts">
	import { t } from '@luft/i18n';
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

<Row title={t('app-sandbox-change-title')} description={t('app-sandbox-change-description')}>
	<button type="button" class="button" onclick={() => (open = true)}>{t('app-sandbox-change')}</button>
</Row>

{#if open}
	<Dialog title={t('app-sandbox-title', { name: app.name })} wide onclose={() => (open = false)}>
		<div class="flex flex-col">
			<Row title={t('app-sandbox-microphone')} description={t('app-sandbox-microphone-description')}>
				<Switch label={t('app-sandbox-microphone')} checked={microphone} disabled={busy} onchange={(on) => change('microphone', on)} />
			</Row>
			<Row title={t('app-sandbox-camera')} description={t('app-sandbox-camera-description')}>
				<Switch label={t('app-sandbox-camera')} checked={camera} disabled={busy} onchange={(on) => change('camera', on)} />
			</Row>
			<Row title={t('app-sandbox-downloads')} description={t('app-sandbox-downloads-description')}>
				<Switch label={t('app-sandbox-downloads')} checked={downloads} disabled={busy} onchange={(on) => change('downloads', on)} />
			</Row>
			<Row title={t('app-sandbox-x11')} description={t('app-sandbox-x11-description')}>
				<Switch label={t('app-sandbox-x11')} checked={x11} disabled={busy} onchange={(on) => change('x11', on)} />
			</Row>
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
