<script lang="ts">
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import Eraser from '@lucide/svelte/icons/eraser';
	import Hourglass from '@lucide/svelte/icons/hourglass';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import PanelLeftOpen from '@lucide/svelte/icons/panel-left-open';
	import Usb from '@lucide/svelte/icons/usb';
	import { t } from '@luft/i18n';
	import { bytes, Choice, Dialog } from '@luft/ui';
	import type { Blocked } from '#lib/api/meet.js';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import SpaceBar from '#lib/components/SpaceBar.svelte';
	import { luft } from '#lib/state/luft.svelte.js';
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';

	const GIB = 1024 ** 3;
	const HELD: Record<Exclude<Blocked, 'busy' | 'elsewhere'>, string> = {
		encrypted: 'luft-resize-encrypted',
		apart: 'luft-resize-apart',
		unreadable: 'luft-resize-unreadable'
	};

	let restarting = $state(false);
	let removing = $state(false);
	let installed = $derived(luft.installed);
	let pending = $derived(installed?.pending ?? null);
	let held = $derived(installed?.blocked && installed.blocked !== 'busy' && installed.blocked !== 'elsewhere' ? HELD[installed.blocked] : null);

	let description = $derived(
		!installed ? t('luft-looking') : installed.besideWindows ? t('luft-description-beside') : t('luft-description-drive', { drive: installed.drive })
	);

	function restart() {
		restarting = false;
		void luft.start();
	}

	function remove() {
		removing = false;
		void luft.remove();
	}
</script>

<Frame title={t('luft-title')} {description}>
	{#if !installed}
		<div class="flex items-center gap-3 py-2 text-[14px] text-[var(--text-soft)]">
			{#if session.failure}
				<Problem failure={session.failure} />
			{:else}
				<LoaderCircle size={18} class="animate-spin" />{t('luft-checking')}
			{/if}
		</div>
	{:else}
		{#if installed.besideWindows}
			<SpaceBar windows={installed.windowsSize} windowsUsed={installed.windowsUsed} luft={installed.size} luftUsed={installed.allocated} />
		{/if}
		<div class="-mx-2 mt-6 flex flex-col gap-1">
			{#if pending}
				<Choice
					icon={Hourglass}
					title={pending.change === 'grow' ? t('luft-pending-grow') : t('luft-pending-shrink')}
					description={pending.change === 'grow' ? t('luft-pending-grow-description') : t('luft-pending-shrink-description')}
					onclick={() => (restarting = true)}
				/>
			{:else if installed.besideWindows}
				<Choice
					icon={ArrowLeftRight}
					title={t('luft-resize-title')}
					description={held ? t(held) : t('luft-resize-description')}
					disabled={!!held}
					onclick={() => luft.measure()}
				/>
			{/if}
			{#if installed.windowsFree >= GIB}
				<Choice
					icon={PanelLeftOpen}
					title={t('luft-windows-free-title')}
					description={t('luft-windows-free-description', { size: bytes(installed.windowsFree) })}
					onclick={() => luft.giveWindows()}
				/>
			{/if}
			{#if installed.leftovers}
				<Choice
					icon={Eraser}
					title={t('luft-leftovers-title')}
					description={t('luft-leftovers-description')}
					onclick={() => luft.cleanUp()}
				/>
			{/if}
			<Choice icon={Usb} title={t('stick-title')} description={t('ready-stick-description')} onclick={() => maker.open()} />
		</div>
		{#if session.failure}
			<div class="mt-4"><Problem failure={session.failure} /></div>
		{/if}
	{/if}
	{#snippet actions()}
		{#if installed}
			<button type="button" class="plain-button large mr-auto -ml-3" disabled={session.busy} onclick={() => (removing = true)}>{t('luft-remove')}</button>
			{#if pending}
				<button type="button" class="plain-button large" disabled={session.busy} onclick={() => luft.cancel()}>{t('luft-cancel')}</button>
			{/if}
			<button type="button" class="button large px-6" disabled={session.busy} onclick={() => (restarting = true)}>{t('luft-start')}</button>
		{/if}
	{/snippet}
</Frame>

{#if restarting}
	<Dialog title={t('meet-restart-title')} description={pending ? t('luft-restart-pending') : t('luft-restart')} onclose={() => (restarting = false)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (restarting = false)}>{t('meet-not-yet')}</button>
			<button type="button" class="button primary" onclick={restart}>{t('meet-restart')}</button>
		{/snippet}
	</Dialog>
{/if}

{#if removing && installed}
	<Dialog
		title={t('luft-remove-title')}
		description={installed.besideWindows
			? t('luft-remove-description', { size: bytes(installed.size) })
			: t('luft-remove-drive-description', { size: bytes(installed.size), drive: installed.drive })}
		onclose={() => (removing = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = false)}>{t('meet-keep-it')}</button>
			<button type="button" class="button danger" onclick={remove}>{t('luft-remove-confirm')}</button>
		{/snippet}
	</Dialog>
{/if}
