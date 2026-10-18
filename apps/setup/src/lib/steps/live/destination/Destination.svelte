<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import LayoutPanelLeft from '@lucide/svelte/icons/layout-panel-left';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import { bytes, Choice, Dialog } from '@luft/ui';
	import type { Drive, Target, WindowsVolume } from '#lib/api/installer.js';
	import { finishSetup } from '#lib/api/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { install } from '#lib/state/install.svelte.js';
	import Alongside from './Alongside.svelte';
	import Custom from './Custom.svelte';
	import MeetRoom from './MeetRoom.svelte';
	import Replace from './Replace.svelte';
	import WholeDrive from './WholeDrive.svelte';
	import { whyNotReplaced, windowsName } from './explain.js';

	type View = 'choose' | 'alongside' | 'whole' | 'custom' | 'replace';

	let replaceable = $derived(install.systems.filter((system) => !system.blocked));
	let view = $state<View>(install.meet ? 'alongside' : 'choose');
	let trail = $state<View[]>([]);
	let replacing = $state<string | null>(null);
	let choicesSeen = $derived(view === 'choose' || trail.includes('choose'));

	$effect(() => {
		if (view !== 'choose' || trail.length > 0) return;
		if (install.meet) {
			view = 'alongside';
		} else if (install.intent === 'replace' && !replacing && replaceable.length === 1) {
			replacing = replaceable[0].id;
			view = 'replace';
		}
	});

	let size = $state(0);
	let wholeDrive = $state<string | null>(null);
	let freeSpace = $state<string | null>(null);
	let confirming = $state(false);

	let survey = $derived(install.survey);
	let windowsDrive = $derived(install.windowsDrive as (Drive & { windows: WindowsVolume }) | null);
	let meet = $derived(install.meet);
	let meetDrive = $derived(meet ? install.drive(meet.drive) : null);
	let target = $derived.by((): Target | null => {
		if (view === 'alongside' && meet?.space) return { kind: 'free', drive: meet.drive, offset: meet.space.offset };
		if (view === 'alongside' && windowsDrive && size > 0) return { kind: 'alongside', drive: windowsDrive.block, size };
		if (view === 'whole' && wholeDrive) return { kind: 'whole', drive: wholeDrive };
		if (view === 'replace' && replacing) return { kind: 'replace', system: replacing };
		if (view === 'custom' && freeSpace) {
			const [drive, offset] = freeSpace.split('@');
			return { kind: 'free', drive, offset: Number(offset) };
		}
		return null;
	});
	let chosenSystem = $derived(install.systems.find((system) => system.id === replacing) ?? null);
	let chosenDrive = $derived(target ? install.drive(target.kind === 'replace' ? (chosenSystem?.drive ?? '') : target.drive) : null);

	const MEET_ROOM: [string, string] = ['Next to Windows', 'Meet Luft already made this room, so Windows stays just as it is.'];
	const TITLES: Record<View, [string, string]> = {
		choose: ['Where should Luft go?', 'Pick how Luft fits on this computer. Nothing changes until you confirm.'],
		alongside: ['Make room next to Windows', 'Windows gets smaller to make space for Luft. Your files in Windows stay as they are.'],
		whole: ['Choose a drive', 'Luft takes over the whole drive. Everything on it is erased.'],
		custom: ['Choose the space for Luft', 'Use Disks to arrange your drives your way.'],
		replace: ['', 'Luft takes its place and keeps what’s yours.']
	};

	let [title, description] = $derived(
		view === 'alongside' && meet?.space ? MEET_ROOM : view === 'replace' ? [`Replace ${chosenSystem?.name ?? 'Linux'}`, TITLES.replace[1]] : TITLES[view]
	);

	async function justTry() {
		if (!(await finishSetup().catch(() => false))) await appWindow.close();
	}

	async function start() {
		confirming = false;
		if (!target || !(await install.install(target))) return;
		if (install.replacing?.owner?.password) flow.skip('account');
		flow.next();
	}

	function open(next: View) {
		trail = [...trail, view];
		view = next;
	}

	function back() {
		install.startError = '';
		view = trail.at(-1)!;
		trail = trail.slice(0, -1);
	}
</script>

<StepFrame {title} {description} onback={trail.length > 0 ? back : undefined} hideBack={install.starting}>
	{#if !survey}
		<div class="flex items-center gap-3 py-2 text-[14px] text-[var(--text-soft)]">
			{#if install.surveyError}
				<span class="text-[var(--danger)]">{install.surveyError}</span>
				<button type="button" class="plain-button" onclick={() => install.look()}>Try again</button>
			{:else}
				<LoaderCircle size={18} class="animate-spin" />Looking at your drives…
			{/if}
		</div>
	{:else if view === 'choose'}
		<div class="-mx-2 flex flex-col gap-1">
			{#if meet?.space}
				<Choice icon={LayoutPanelLeft} title="Alongside Windows" description="Use the {bytes(meet.space.size)} Meet Luft made next to Windows." onclick={() => open('alongside')} />
			{:else if windowsDrive}
				<Choice icon={LayoutPanelLeft} title="Alongside {windowsName(windowsDrive.windows)}" description="Keep Windows and its files, and give Luft part of its drive." onclick={() => open('alongside')} />
			{/if}
			{#each install.systems as system (system.id)}
				<Choice
					icon={ArrowRightLeft}
					title="Replace {system.name}"
					description={system.blocked ? whyNotReplaced(system) : 'Keep your files, your account and your settings, and let Luft take its place.'}
					disabled={!!system.blocked}
					onclick={() => {
						replacing = system.id;
						open('replace');
					}}
				/>
			{/each}
			<Choice icon={HardDrive} title="Use a whole drive" description="Erase a drive and give all of it to Luft." disabled={install.usableDrives.length === 0} onclick={() => open('whole')} />
			<Choice icon={Sparkles} title="Just try Luft" description="Look around first. Nothing is installed and your drives stay untouched." onclick={justTry} />
			<Choice icon={SlidersHorizontal} title="Custom" description="Arrange partitions yourself in Disks." onclick={() => open('custom')} />
		</div>
	{:else if view === 'alongside' && meet?.space && meetDrive}
		<MeetRoom drive={meetDrive} space={meet.space} packed={meet.movingBox?.bytes ?? null} />
	{:else if view === 'alongside' && windowsDrive}
		<Alongside drive={windowsDrive} smallest={survey.smallestSystem} onsize={(next) => (size = next)} />
	{:else if view === 'whole'}
		<WholeDrive selected={wholeDrive} onselect={(block) => (wholeDrive = block)} />
	{:else if view === 'replace' && chosenSystem}
		<Replace system={chosenSystem} />
	{:else if view === 'custom'}
		<Custom selected={freeSpace} onselect={(key) => (freeSpace = key)} />
	{/if}
	{#if view !== 'alongside' && view !== 'replace' && install.startError}
		<p class="mt-4 text-[13.5px] text-[var(--danger)]">{install.startError}</p>
	{/if}
	{#snippet actions()}
		{#if !choicesSeen && survey}
			<button type="button" class="plain-button large" disabled={install.starting} onclick={() => open('choose')}>More options</button>
		{/if}
		{#if view !== 'choose'}
			<button type="button" class="button primary large px-6" disabled={!target || install.starting} onclick={() => (confirming = true)}>
				{install.starting ? 'Starting…' : view === 'replace' ? 'Replace' : 'Install Luft'}
			</button>
		{/if}
	{/snippet}
</StepFrame>

{#if confirming && target && chosenDrive}
	<Dialog
		title={target.kind === 'replace' ? `Replace ${chosenSystem?.name}?` : target.kind === 'whole' ? `Erase ${chosenDrive.name}?` : target.kind === 'alongside' ? `Shrink Windows to ${bytes(chosenDrive.windows!.size - target.size)}?` : meet?.space ? 'Install Luft next to Windows?' : 'Install Luft in the free space?'}
		description={target.kind === 'replace'
			? chosenSystem?.keepsOld
				? 'Luft starts copying right away. The old system won’t start anymore, and its files stay until you remove them.'
				: 'Luft starts copying right away. The old system is erased for good, and your files stay where they are.'
			: target.kind === 'whole'
			? 'Everything on this drive is erased for good, including other systems and files.'
			: 'Luft starts copying right away. You can set up your account while it works.'}
		onclose={() => (confirming = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (confirming = false)}>Cancel</button>
			<button type="button" class="button {target.kind === 'whole' ? 'danger' : 'primary'}" onclick={start}>
				{target.kind === 'whole' ? 'Erase and install' : target.kind === 'replace' ? 'Replace' : 'Install'}
			</button>
		{/snippet}
	</Dialog>
{/if}
