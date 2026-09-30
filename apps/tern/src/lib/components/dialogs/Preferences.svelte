<script lang="ts">
	import { Dialog, Row, Section, Segmented, Select, Slider, Switch, appearance } from '@luft/ui';
	import { FONT_SIZES, settings } from '$lib/state/settings.svelte';
	import type { CursorStyle, SchemePreference } from '$lib/types';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	const SCHEMES: { value: SchemePreference; label: string }[] = [
		{ value: 'system', label: 'Desktop' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];

	const CURSORS: { value: CursorStyle; label: string }[] = [
		{ value: 'block', label: 'Block' },
		{ value: 'bar', label: 'Bar' },
		{ value: 'underline', label: 'Underline' }
	];

	const SCROLLBACK = [1_000, 5_000, 10_000, 50_000, 100_000].map((lines) => ({
		value: lines,
		label: `${lines.toLocaleString()} lines`
	}));

	const DEFAULT_SHELL = '';

	let shellName = $derived(settings.defaultShell.split('/').at(-1));
	let shells = $derived([
		{ value: DEFAULT_SHELL, label: `Default (${shellName})` },
		...settings.shells.map((shell) => ({ value: shell, label: shell }))
	]);
	let pendingTranslucency = $derived(appearance.translucent && settings.current.translucent && !settings.glass);
</script>

<Dialog title="Preferences" wide {onclose}>
	<Section title="Appearance">
		<Row title="Style">
			<Segmented label="Style" options={SCHEMES} value={settings.current.scheme} onchange={(scheme) => settings.update({ scheme })} />
		</Row>
		{#if appearance.translucent}
			<Row
				title="See-through background"
				description={pendingTranslucency ? 'Takes effect the next time Tern opens.' : 'Lets the desktop show through, softly blurred.'}
			>
				<Switch label="See-through background" checked={settings.current.translucent} onchange={(translucent) => settings.update({ translucent })} />
			</Row>
			{#if settings.translucent}
				<Row title="Background strength">
					{#snippet below()}
						<Slider
							label="Background strength"
							value={settings.current.opacity}
							min={0.5}
							max={1}
							step={0.01}
							format={(value) => `${Math.round(value * 100)}%`}
							oninput={(opacity) => (settings.current.opacity = opacity)}
							onchange={(opacity) => settings.update({ opacity })}
						/>
					{/snippet}
				</Row>
			{/if}
		{/if}
		<Row title="Text size">
			{#snippet below()}
				<Slider
					label="Text size"
					value={settings.current.fontSize}
					min={FONT_SIZES.min}
					max={FONT_SIZES.max}
					step={1}
					format={(value) => `${value} pt`}
					onchange={(fontSize) => settings.update({ fontSize })}
				/>
			{/snippet}
		</Row>
	</Section>

	<Section title="Cursor">
		<Row title="Shape">
			<Segmented label="Cursor shape" options={CURSORS} value={settings.current.cursorStyle} onchange={(cursorStyle) => settings.update({ cursorStyle })} />
		</Row>
		<Row title="Blink">
			<Switch label="Blink" checked={settings.current.cursorBlink} onchange={(cursorBlink) => settings.update({ cursorBlink })} />
		</Row>
	</Section>

	<Section title="Behavior">
		<Row title="Shell" description="New tabs and panes start with this shell.">
			<Select label="Shell" options={shells} value={settings.current.shell ?? DEFAULT_SHELL} onchange={(shell) => settings.update({ shell: shell || null })} />
		</Row>
		<Row title="History" description="How many lines each terminal keeps to scroll back through.">
			<Select label="History" options={SCROLLBACK} value={settings.current.scrollback} onchange={(scrollback) => settings.update({ scrollback })} />
		</Row>
		<Row title="Copy selected text" description="Copies text as soon as you select it.">
			<Switch label="Copy selected text" checked={settings.current.copyOnSelect} onchange={(copyOnSelect) => settings.update({ copyOnSelect })} />
		</Row>
		<Row title="Let programs read the clipboard" description="Programs in the terminal, including ones on other computers over SSH, can read what you copied.">
			<Switch label="Let programs read the clipboard" checked={settings.current.clipboardReads} onchange={(clipboardReads) => settings.update({ clipboardReads })} />
		</Row>
	</Section>

	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
