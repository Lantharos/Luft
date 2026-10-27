<script lang="ts">
	import HardDriveDownload from '@lucide/svelte/icons/hard-drive-download';
	import Package from '@lucide/svelte/icons/package';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Usb from '@lucide/svelte/icons/usb';
	import { t } from '@luft/i18n';
	import { bytes, Choice, Dialog, Switch } from '@luft/ui';
	import type { Intent, WindowsChoices } from '#lib/bindings.js';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';

	interface Option {
		key: keyof WindowsChoices;
		title: string;
		description: string;
	}

	let restarting = $state<Intent | null>(null);
	let removing = $state(false);
	let choices = $state<Required<WindowsChoices>>({ fastStartupOff: true, universalClock: true });
	let prepared = $derived(session.prepared);
	let facts = $derived(session.windows);

	let options = $derived(
		[
			facts?.fastStartup && {
				key: 'fastStartupOff',
				title: t('ready-fast-startup-title'),
				description: t('ready-fast-startup-description')
			},
			facts &&
				!facts.universalClock && {
					key: 'universalClock',
					title: t('ready-clock-title'),
					description: t('ready-clock-description')
				}
		].filter((option): option is Option => !!option)
	);

	async function restart() {
		const intent = restarting!;
		const windows = Object.fromEntries(options.map((option) => [option.key, choices[option.key]])) as Partial<WindowsChoices>;
		restarting = null;
		await session.restart(intent, { fastStartupOff: false, universalClock: false, ...windows });
	}

	function remove() {
		removing = false;
		void session.remove();
	}
</script>

<Frame title={t('ready-title')} description={t('ready-description')}>
	<div class="-mx-2 flex flex-col gap-1">
		{#if session.report?.outdated}
			<Choice
				icon={RefreshCw}
				title={t('ready-update-title')}
				description={t('ready-update-description')}
				onclick={() => session.update()}
			/>
		{/if}
		<Choice icon={Sparkles} title={t('ready-try-title')} description={t('ready-try-description')} onclick={() => (restarting = 'try')} />
		<Choice
			icon={Package}
			title={t('box-title')}
			description={t('ready-box-description')}
			note={prepared?.movingBox ? t('ready-box-packed', { size: bytes(prepared.movingBox) }) : undefined}
			onclick={() => session.go('box')}
		/>
		<Choice
			icon={HardDriveDownload}
			title={t('ready-install-title')}
			description={prepared?.drive
				? t('ready-install-drive-description', { size: bytes(prepared.room), drive: prepared.drive })
				: t('ready-install-description', { size: bytes(prepared?.room ?? 0) })}
			onclick={() => (restarting = 'install')}
		/>
		<Choice icon={Usb} title={t('stick-title')} description={t('ready-stick-description')} onclick={() => maker.open()} />
	</div>
	{#if session.failure}
		<div class="mt-4"><Problem failure={session.failure} /></div>
	{/if}
	{#snippet actions()}
		<button type="button" class="plain-button large mr-auto -ml-3" onclick={() => (removing = true)}>{t('ready-remove')}</button>
		<button type="button" class="plain-button large" onclick={() => session.chooseIso()}>
			{session.source.kind === 'file' ? t('meet-iso-using') : t('meet-iso-use')}
		</button>
	{/snippet}
</Frame>

{#if restarting}
	<Dialog
		title={t('meet-restart-title')}
		description={restarting === 'try' ? t('ready-restart-try') : t('ready-restart-install')}
		onclose={() => (restarting = null)}
	>
		{#if options.length > 0}
			<div class="flex flex-col gap-4">
				{#each options as option (option.key)}
					<div class="flex items-center gap-4">
						<div class="flex min-w-0 flex-1 flex-col gap-0.5">
							<span class="text-[14px] font-medium">{option.title}</span>
							<span class="text-[13px] leading-snug text-[var(--text-soft)]">{option.description}</span>
						</div>
						<Switch checked={choices[option.key]} label={option.title} onchange={(checked) => (choices[option.key] = checked)} />
					</div>
				{/each}
			</div>
		{/if}
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (restarting = null)}>{t('meet-not-yet')}</button>
			<button type="button" class="button primary" onclick={restart}>{t('meet-restart')}</button>
		{/snippet}
	</Dialog>
{/if}

{#if removing}
	<Dialog
		title={t('ready-remove-title')}
		description={t('ready-remove-description')}
		onclose={() => (removing = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = false)}>{t('meet-keep-it')}</button>
			<button type="button" class="button danger" onclick={remove}>{t('meet-remove')}</button>
		{/snippet}
	</Dialog>
{/if}
