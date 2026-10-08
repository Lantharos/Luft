<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import { fromEvent } from './accelerator';
	import Keys from './Keys.svelte';

	interface Props {
		accelerators: string[];
		recording: boolean;
		oncapture: (accelerator: string | null) => void;
		oncancel?: () => void;
	}

	let { accelerators, recording = $bindable(), oncapture, oncancel }: Props = $props();

	let held = $state<string[]>([]);

	function modifiers(event: KeyboardEvent) {
		return [
			[event.metaKey, 'Super'],
			[event.ctrlKey, 'Ctrl'],
			[event.altKey, 'Alt'],
			[event.shiftKey, 'Shift']
		]
			.filter(([down]) => down)
			.map(([, label]) => label as string);
	}

	function keydown(event: KeyboardEvent) {
		event.preventDefault();
		event.stopPropagation();
		held = modifiers(event);
		const plain = held.length === 0;
		if (plain && event.key === 'Escape') {
			recording = false;
			oncancel?.();
		} else if (plain && event.code === 'Backspace') {
			recording = false;
			oncapture(null);
		} else {
			const accelerator = fromEvent(event);
			if (!accelerator) return;
			recording = false;
			oncapture(accelerator);
		}
		held = [];
	}

	function keyup(event: KeyboardEvent) {
		held = modifiers(event);
	}

	function stop() {
		recording = false;
	}

	$effect(() => {
		if (!recording) return;
		window.addEventListener('keydown', keydown, true);
		window.addEventListener('keyup', keyup, true);
		window.addEventListener('blur', stop);
		void appWindow.inhibitShortcuts(true).catch(() => {});
		return () => {
			window.removeEventListener('keydown', keydown, true);
			window.removeEventListener('keyup', keyup, true);
			window.removeEventListener('blur', stop);
			void appWindow.inhibitShortcuts(false).catch(() => {});
		};
	});
</script>

<button type="button" class="capture" class:recording onclick={() => (recording = true)}>
	{#if recording}
		<span class="text-[13px] text-[var(--text-soft)]">{held.length ? `${held.join(' + ')} + …` : 'Press the keys you want'}</span>
	{:else}
		<Keys {accelerators} />
	{/if}
</button>

<style>
	.capture {
		display: flex;
		min-height: 64px;
		width: 100%;
		align-items: center;
		justify-content: center;
		border-radius: 16px;
		background: var(--control);
		transition: background-color 160ms var(--ease), box-shadow 160ms var(--ease);
	}

	.capture:hover {
		background: var(--control-hover);
	}

	.capture.recording {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}
</style>
