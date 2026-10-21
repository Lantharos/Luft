<script lang="ts">
	import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';
	import HardDriveDownload from '@lucide/svelte/icons/hard-drive-download';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Usb from '@lucide/svelte/icons/usb';
	import { t } from '@luft/i18n';
	import { Choice, Dialog } from '@luft/ui';
	import type { Intent } from '#lib/bridge/meet.js';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';

	const REPLACEABLE = ['subvolumes', 'separateHome'];

	let restarting = $state<Intent | null>(null);
	let removing = $state(false);
	let system = $derived(session.linux?.system ?? t('linux-ready-this-system'));
	let replaceable = $derived(REPLACEABLE.includes(session.linux?.layout ?? ''));

	let restartNote = $derived(
		restarting === 'try'
			? t('linux-ready-restart-try', { system })
			: restarting === 'replace'
				? t('linux-ready-restart-replace', { system })
				: t('ready-restart-install')
	);

	function restart() {
		const intent = restarting!;
		restarting = null;
		void session.restart(intent, { fastStartupOff: false, universalClock: false });
	}

	function remove() {
		removing = false;
		void session.remove();
	}
</script>

<Frame title={t('ready-title')} description={t('linux-ready-description', { system })}>
	<div class="-mx-2 flex flex-col gap-1">
		{#if session.report?.outdated}
			<Choice
				icon={RefreshCw}
				title={t('ready-update-title')}
				description={t('linux-ready-update-description')}
				onclick={() => session.update()}
			/>
		{/if}
		<Choice icon={Sparkles} title={t('ready-try-title')} description={t('linux-ready-try-description', { system })} onclick={() => (restarting = 'try')} />
		{#if replaceable}
			<Choice
				icon={ArrowRightLeft}
				title={t('linux-ready-replace-title', { system })}
				description={t('linux-ready-replace-description')}
				onclick={() => (restarting = 'replace')}
			/>
		{/if}
		<Choice
			icon={HardDriveDownload}
			title={t('ready-install-title')}
			description={t('linux-ready-install-description')}
			onclick={() => (restarting = 'install')}
		/>
		<Choice icon={Usb} title={t('stick-title')} description={t('ready-stick-description')} onclick={() => maker.open()} />
	</div>
	{#if session.failure}
		<div class="mt-4"><Problem failure={session.failure} /></div>
	{/if}
	{#snippet actions()}
		<button type="button" class="plain-button large mr-auto -ml-3" onclick={() => (removing = true)}>{t('linux-ready-remove')}</button>
		<button type="button" class="plain-button large" onclick={() => session.chooseIso()}>
			{session.source.kind === 'file' ? t('meet-iso-using') : t('meet-iso-use')}
		</button>
	{/snippet}
</Frame>

{#if restarting}
	<Dialog title={t('meet-restart-title')} description={restartNote} onclose={() => (restarting = null)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (restarting = null)}>{t('meet-not-yet')}</button>
			<button type="button" class="button primary" onclick={restart}>{t('meet-restart')}</button>
		{/snippet}
	</Dialog>
{/if}

{#if removing}
	<Dialog
		title={t('linux-ready-remove-title')}
		description={t('linux-ready-remove-description')}
		onclose={() => (removing = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = false)}>{t('meet-keep-it')}</button>
			<button type="button" class="button danger" onclick={remove}>{t('meet-remove')}</button>
		{/snippet}
	</Dialog>
{/if}
