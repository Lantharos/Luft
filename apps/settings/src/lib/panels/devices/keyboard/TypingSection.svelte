<script lang="ts">
	import { Row, Section, Select, Slider, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';

	type Keyboard = { repeat: boolean; delay: number; 'repeat-interval': number };

	const SLOWEST_INTERVAL = 110;
	const FASTEST_INTERVAL = 10;
	const CAPS_LOCK = [
		{ value: '', label: 'Caps Lock' },
		{ value: 'caps:ctrl_modifier', label: 'Ctrl' },
		{ value: 'caps:escape', label: 'Escape' },
		{ value: 'caps:swapescape', label: 'Swap with Escape' },
		{ value: 'caps:none', label: 'Nothing' }
	];
	const CAPS_LOCK_OPTION = /^caps:|^ctrl:(nocaps|swapcaps)$/;

	const keyboard = useSettings<Keyboard>('org.gnome.desktop.peripherals.keyboard', ['repeat', 'delay', 'repeat-interval']);
	const inputSources = useSettings<{ 'xkb-options': string[] }>('org.gnome.desktop.input-sources', ['xkb-options']);

	let repeat = $derived(keyboard.values.repeat ?? true);
	let options = $derived(inputSources.values['xkb-options'] ?? []);
	let capsLock = $derived(options.find((option) => CAPS_LOCK_OPTION.test(option)) ?? '');

	function setCapsLock(option: string) {
		const kept = options.filter((existing) => !CAPS_LOCK_OPTION.test(existing));
		void inputSources.set('xkb-options', option ? [...kept, option] : kept);
	}
</script>

<Section title="Typing">
	<Row title="Repeat keys" description="Holding a key down types it again and again">
		<Switch label="Repeat keys" checked={repeat} onchange={(on) => keyboard.set('repeat', on)} />
	</Row>
	<Row title="Delay before repeating" disabled={!repeat}>
		{#snippet below()}
			<div class="flex items-center gap-3 text-[12.5px] text-[var(--text-muted)]">
				<span>Shorter</span>
				<Slider
					label="Delay before repeating"
					min={100}
					max={2000}
					step={50}
					disabled={!repeat}
					value={keyboard.values.delay ?? 500}
					onchange={(delay) => keyboard.set('delay', delay)}
				/>
				<span>Longer</span>
			</div>
		{/snippet}
	</Row>
	<Row title="Repeat speed" disabled={!repeat}>
		{#snippet below()}
			<div class="flex items-center gap-3 text-[12.5px] text-[var(--text-muted)]">
				<span>Slower</span>
				<Slider
					label="Repeat speed"
					min={FASTEST_INTERVAL}
					max={SLOWEST_INTERVAL}
					step={5}
					disabled={!repeat}
					value={SLOWEST_INTERVAL + FASTEST_INTERVAL - (keyboard.values['repeat-interval'] ?? 30)}
					onchange={(speed) => keyboard.set('repeat-interval', SLOWEST_INTERVAL + FASTEST_INTERVAL - speed)}
				/>
				<span>Faster</span>
			</div>
		{/snippet}
	</Row>
	<Row title="Caps Lock key" description="What happens when you press it">
		<Select label="Caps Lock key" options={CAPS_LOCK} value={capsLock} placeholder="Custom" onchange={setCapsLock} />
	</Row>
</Section>
