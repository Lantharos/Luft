<script lang="ts">
	import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';
	import HardDriveDownload from '@lucide/svelte/icons/hard-drive-download';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Usb from '@lucide/svelte/icons/usb';
	import { Choice, Dialog } from '@luft/ui';
	import type { Intent } from '#lib/api/meet.js';
	import Frame from '#lib/components/Frame.svelte';
	import Problem from '#lib/components/Problem.svelte';
	import { session } from '#lib/state/meet.svelte.js';
	import { maker } from '#lib/state/stick.svelte.js';

	const REPLACEABLE = ['subvolumes', 'separateHome'];

	let restarting = $state<Intent | null>(null);
	let removing = $state(false);
	let system = $derived(session.linux?.system ?? 'this system');
	let replaceable = $derived(REPLACEABLE.includes(session.linux?.layout ?? ''));

	let restartNote = $derived(
		restarting === 'try'
			? `Save anything you’re working on first. Luft opens in a minute or so, and the next restart brings you back to ${system}.`
			: restarting === 'replace'
				? `Save anything you’re working on first. The installer opens with ${system} chosen to replace, and shows what stays before anything changes.`
				: 'Save anything you’re working on first. The installer opens in a minute or so, and nothing changes until you confirm there.'
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

<Frame title="Luft is ready" description="Choose how you’d like to meet it. {system} keeps starting as usual until you decide otherwise.">
	<div class="-mx-2 flex flex-col gap-1">
		{#if session.report?.outdated}
			<Choice
				icon={RefreshCw}
				title="Get the newest Luft"
				description="A newer build is out. It replaces the one Meet Luft keeps and keeps the logs from trying it."
				onclick={() => session.update()}
			/>
		{/if}
		<Choice icon={Sparkles} title="Try Luft" description="Restart into Luft without changing anything. {system} starts as usual next time." onclick={() => (restarting = 'try')} />
		{#if replaceable}
			<Choice
				icon={ArrowRightLeft}
				title="Replace {system}"
				description="Luft takes its place and keeps your files, your account, Wi-Fi networks and other drives. The old system stays until you remove it."
				onclick={() => (restarting = 'replace')}
			/>
		{/if}
		<Choice
			icon={HardDriveDownload}
			title="Install Luft"
			description="Restart into the installer to put Luft on another drive or in free space."
			onclick={() => (restarting = 'install')}
		/>
		<Choice icon={Usb} title="Make a USB stick" description="Put Luft on a stick to start it on any computer." onclick={() => maker.open()} />
	</div>
	{#if session.failure}
		<div class="mt-4"><Problem failure={session.failure} /></div>
	{/if}
	{#snippet actions()}
		<button type="button" class="plain-button large mr-auto -ml-3" onclick={() => (removing = true)}>Remove Luft from this computer</button>
		<button type="button" class="plain-button large" onclick={() => session.chooseIso()}>
			{session.source.kind === 'file' ? 'Using your Luft ISO' : 'Use an ISO I already have'}
		</button>
	{/snippet}
</Frame>

{#if restarting}
	<Dialog title="Restart now?" description={restartNote} onclose={() => (restarting = null)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (restarting = null)}>Not yet</button>
			<button type="button" class="button primary" onclick={restart}>Restart</button>
		{/snippet}
	</Dialog>
{/if}

{#if removing}
	<Dialog
		title="Remove Luft from this computer?"
		description="Meet Luft deletes Luft’s files, its start files and its start entry. Everything else stays as it is."
		onclose={() => (removing = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = false)}>Keep it</button>
			<button type="button" class="button danger" onclick={remove}>Remove</button>
		{/snippet}
	</Dialog>
{/if}
