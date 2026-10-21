<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { t } from '@luft/i18n';
	import { appearance, GlassShell, Toast, WindowControls } from '@luft/ui';
	import * as meet from '#lib/bridge/meet.js';
	import { luft } from '#lib/state/luft.svelte.js';
	import { session } from '#lib/state/meet.svelte.js';
	import Working from '#lib/steps/Working.svelte';
	import Removed from '#lib/steps/luft/Removed.svelte';
	import Resize from '#lib/steps/luft/Resize.svelte';
	import YourLuft from '#lib/steps/luft/YourLuft.svelte';
	import LinuxReady from '#lib/steps/prepare/LinuxReady.svelte';
	import MovingBox from '#lib/steps/prepare/MovingBox.svelte';
	import Ready from '#lib/steps/prepare/Ready.svelte';
	import Room from '#lib/steps/prepare/Room.svelte';
	import Check from '#lib/steps/start/Check.svelte';
	import Hello from '#lib/steps/start/Hello.svelte';
	import Stick from '#lib/steps/stick/Stick.svelte';
	import StickDone from '#lib/steps/stick/StickDone.svelte';

	const STEPS = {
		hello: Hello,
		luft: YourLuft,
		resize: Resize,
		check: Check,
		room: Room,
		working: Working,
		ready: Ready,
		box: MovingBox,
		removed: Removed,
		stick: Stick,
		stickDone: StickDone
	};
	const SLIDE = 28;

	const SHORTCUTS: Record<string, () => unknown> = {
		KeyN: () => session.switchChannel(),
		KeyL: () => session.saveLogs()
	};

	function onkeydown(event: KeyboardEvent) {
		const shortcut = SHORTCUTS[event.code];
		if (!event.ctrlKey || !event.shiftKey || event.altKey || !shortcut) return;
		event.preventDefault();
		void shortcut();
	}

	onMount(() => {
		const stops = [session.listen()];
		void meet.installed().then((installed) => {
			if (installed && session.step === 'hello') void luft.open();
		});
		void meet.locale().then((locale) => {
			stops.push(appearance.start({ palette: null, typography: { interface: null, monospace: null, textScale: 1 }, motion: 'full', locale }));
		});
		return () => stops.forEach((stop) => stop());
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	let Step = $derived(session.step === 'ready' && session.platform === 'linux' ? LinuxReady : STEPS[session.step]);
</script>

<svelte:window {onkeydown} />

<GlassShell class="meet-window">
	<main class="relative flex min-w-0 flex-1 flex-col overflow-hidden">
		<div class="drag-region absolute inset-x-0 top-0 z-10 flex h-12 items-center justify-between pr-3 pl-14">
			<span class="text-[12.5px] text-[var(--text-muted)]">{session.nightly ? t('meet-nightly') : ''}</span>
			<WindowControls maximizable={false} closable={session.step !== 'working'} />
		</div>
		{#key session.step}
			<div class="absolute inset-0" in:fly={{ x: SLIDE * session.direction, duration: 260, easing: cubicOut }} out:fly={{ x: -SLIDE * session.direction, duration: 160 }}>
				<Step />
			</div>
		{/key}
		<Toast
			class="absolute z-20"
			toast={session.notes.current}
			ondismiss={session.notes.dismiss}
			onhold={session.notes.hold}
			onrelease={session.notes.release}
		/>
	</main>
</GlassShell>
