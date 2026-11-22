<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import { t } from '@luft/i18n';
	import { fade } from '@luft/ui';
	import type { InstalledApp, Operation } from '#lib/bindings.js';
	import Managed from '#lib/components/Managed.svelte';
	import ProgressButton from '#lib/components/ProgressButton.svelte';
	import type { FileInstall } from '#lib/files/install.svelte.js';
	import { opening } from '#lib/state/opening.svelte.js';
	import { allowance } from '#lib/state/policy.svelte.js';

	interface Props {
		install: FileInstall;
		phase: 'unreadable' | 'running' | 'failed' | 'done' | 'ready';
		running: Operation | null;
		retry: () => void;
		onremove: () => void;
	}

	interface Action {
		label: string;
		run: () => void;
		primary?: boolean;
	}

	let { install, phase, running, retry, onremove }: Props = $props();

	const close = () => void appWindow.close();
	const permit = allowance(() => install.job);

	async function open(app: InstalledApp, desktop: string | null) {
		await opening.open(app, desktop);
		const failed = opening.failed;
		if (!failed) return close();
		opening.dismiss();
		await install.ask({ kind: 'openFailed', failed });
	}

	function openAction(app: InstalledApp | null, desktop: string | null, primary: boolean): Action[] {
		return app && desktop ? [{ label: t('install-open'), run: () => void open(app, desktop), primary }] : [];
	}

	function listedActions(): Action[] {
		const listed = install.listed!;
		const from = install.fromListing;
		const viaListing = t(listed.store ? 'install-from-store' : 'install-from-flathub');
		const file: Action = { label: t('install-file'), run: () => install.install() };
		if (from) return [file, ...openAction(from, from.desktop, true)];
		if (install.listedVersionChange === 'down') return [{ label: viaListing, run: () => install.installListed() }, { ...file, label: t('install-install'), primary: true }];
		return [file, { label: viaListing, run: () => install.installListed(), primary: true }];
	}

	function ready(): Action[] {
		const file = install.file!;
		const existing = install.existing;
		const installed = existing || ((file.kind === 'package' || file.kind === 'deb') && file.installed);
		if (file.kind === 'deb' && !file.runsHere) return [{ label: t('install-close'), run: close, primary: true }];
		if (!installed) {
			if (!permit.allowed) return [{ label: t('install-close'), run: close, primary: true }];
			if (install.listed) return listedActions();
			return [{ label: t(file.kind === 'flatpakRepo' ? 'install-add-source' : 'install-install'), run: () => install.install(), primary: true }];
		}
		const remove: Action[] = existing ? [{ label: t('install-remove'), run: onremove }] : [];
		if (install.versionChange === 'up') return [...remove, ...openAction(existing, install.desktop, false), { label: t('install-update'), run: () => install.install(), primary: true }];
		const reinstall: Action[] = file.kind === 'appImage' && install.versionChange !== 'down' ? [{ label: t('install-reinstall'), run: () => install.install() }] : [];
		const opens = openAction(existing, install.desktop, true);
		return [...remove, ...reinstall, ...(opens.length ? opens : [{ label: t('install-close'), run: close, primary: true }])];
	}

	function done(): Action[] {
		const app = install.finishedFromListing ? install.fromListing : install.existing;
		const desktop = install.finishedFromListing ? (app?.desktop ?? null) : install.desktop;
		const opens = openAction(app, desktop, true);
		return [{ label: t('install-close'), run: close, primary: !opens.length }, ...opens];
	}

	const actions = $derived.by((): Action[] => {
		if (phase === 'unreadable') return [{ label: t('install-close'), run: close, primary: true }];
		if (phase === 'failed')
			return [
				{ label: t('install-close'), run: close },
				{ label: t('install-try-again'), run: retry, primary: true }
			];
		if (phase === 'done') return done();
		if (phase === 'ready') return ready();
		return [];
	});

	const primary = $derived(actions.find((action) => action.primary) ?? null);

	function keys(event: KeyboardEvent) {
		if (event.key === 'Escape' && !running) close();
		else if (event.key === 'Enter' && primary && !(event.target instanceof HTMLButtonElement)) {
			event.preventDefault();
			primary.run();
		}
	}
</script>

<svelte:window onkeydown={keys} />

{#if running}
	<div in:fade><ProgressButton operation={running} /></div>
{:else}
	{#key `${phase}:${!!install.listed}`}
		<div class="flex items-center gap-2" in:fade>
			{#if phase === 'ready' && !permit.allowed && !install.existing}
				<Managed />
			{/if}
			{#each actions as action (action.label)}
				<button type="button" class={['button', action.primary && 'primary']} onclick={action.run}>{action.label}</button>
			{/each}
		</div>
	{/key}
{/if}
