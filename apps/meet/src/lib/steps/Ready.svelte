<script lang="ts">
	import HardDriveDownload from '@lucide/svelte/icons/hard-drive-download';
	import Package from '@lucide/svelte/icons/package';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Usb from '@lucide/svelte/icons/usb';
	import { bytes, Choice, Dialog, Switch } from '@luft/ui';
	import type { Intent, WindowsChoices } from '#lib/api/meet.js';
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
	let choices = $state<WindowsChoices>({ fastStartupOff: true, universalClock: true });
	let prepared = $derived(session.prepared);
	let facts = $derived(session.windows);

	let options = $derived(
		[
			restarting === 'install' &&
				facts?.fastStartup && {
					key: 'fastStartupOff',
					title: 'Turn off Fast Startup in Windows',
					description: 'Windows then shuts down fully, so sound, Wi-Fi and Bluetooth start fresh in Luft.'
				},
			facts &&
				!facts.universalClock && {
					key: 'universalClock',
					title: 'Keep the clock right in both',
					description: 'Windows reads the computer’s clock the way Luft does, so the time no longer jumps when you switch.'
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

<Frame title="Luft is ready" description="Choose how you’d like to meet it. Windows starts as usual afterwards, unless you install Luft and choose it.">
	<div class="-mx-2 flex flex-col gap-1">
		{#if session.report?.outdated}
			<Choice
				icon={RefreshCw}
				title="Get the newest Luft"
				description="A newer build is out. It replaces this one and keeps the room and anything you packed."
				onclick={() => session.update()}
			/>
		{/if}
		<Choice icon={Sparkles} title="Try Luft" description="Restart into Luft without installing anything. Windows starts as usual next time." onclick={() => (restarting = 'try')} />
		<Choice
			icon={Package}
			title="Bring your things"
			description="Pack documents, photos, Wi-Fi networks and more for Luft to unpack when it’s installed."
			note={prepared?.movingBox ? `Packed, ${bytes(prepared.movingBox)}` : undefined}
			onclick={() => session.go('box')}
		/>
		<Choice
			icon={HardDriveDownload}
			title="Install Luft"
			description="Restart into the installer. The {bytes(prepared?.room ?? 0)} next to Windows is already waiting for it."
			onclick={() => (restarting = 'install')}
		/>
		<Choice icon={Usb} title="Make a USB stick" description="Put Luft on a stick to start it on any computer." onclick={() => maker.open()} />
	</div>
	{#if session.failure}
		<div class="mt-4"><Problem failure={session.failure} /></div>
	{/if}
	{#snippet actions()}
		<button type="button" class="plain-button large mr-auto -ml-3" onclick={() => (removing = true)}>Remove Luft from this PC</button>
		<button type="button" class="plain-button large" onclick={() => session.chooseIso()}>
			{session.source.kind === 'file' ? 'Using your Luft ISO' : 'Use an ISO I already have'}
		</button>
	{/snippet}
</Frame>

{#if restarting}
	<Dialog
		title="Restart now?"
		description={restarting === 'try'
			? 'Save anything you’re working on first. Luft opens in a minute or so, and the next restart brings you back to Windows.'
			: 'Save anything you’re working on first. The installer opens in a minute or so, and nothing changes until you confirm there.'}
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
			<button type="button" class="button" onclick={() => (restarting = null)}>Not yet</button>
			<button type="button" class="button primary" onclick={restart}>Restart</button>
		{/snippet}
	</Dialog>
{/if}

{#if removing}
	<Dialog
		title="Remove Luft from this PC?"
		description="Meet Luft deletes everything it added, including the moving box, and gives Windows all of its space back."
		onclose={() => (removing = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = false)}>Keep it</button>
			<button type="button" class="button danger" onclick={remove}>Remove</button>
		{/snippet}
	</Dialog>
{/if}
