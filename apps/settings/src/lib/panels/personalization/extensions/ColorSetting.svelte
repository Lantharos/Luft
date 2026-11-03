<script lang="ts">
	import { t } from '@luft/i18n';
	import { appearance } from '@luft/ui';
	import type { ExtensionSetting } from '#lib/bindings.js';
	import ColorPicker from '#lib/components/color/ColorPicker.svelte';
	import Swatches from '#lib/components/Swatches.svelte';

	const HUES = 'conic-gradient(#e5484d, #f5a524, #46a758, #12a5b0, #3e63dd, #8e4ec6, #e5484d)';
	const CHROMA = { min: 0, max: 0.25 };
	const CUSTOM = 'custom';

	interface Props {
		setting: ExtensionSetting;
		value: string;
		onchange: (color: string) => void;
	}

	let { setting, value, onchange }: Props = $props();

	let picking = $state<HTMLElement | null>(null);
	let offered = $derived(setting.swatches.some((swatch) => swatch.value === value));
	let options = $derived([
		...setting.swatches.map((swatch) => ({
			value: swatch.value,
			label: swatch.label,
			color: swatch.value === 'accent' ? (appearance.accent ?? 'var(--accent)') : swatch.value === 'wallpaper' ? (appearance.wallpaperAccent ?? appearance.accent ?? 'var(--accent)') : swatch.value
		})),
		{ value: CUSTOM, label: t('settings-extensions-custom-color'), color: offered ? HUES : value }
	]);

	function choose(choice: string, swatch: HTMLElement) {
		if (choice === CUSTOM) picking = swatch;
		else onchange(choice);
	}
</script>

<Swatches label={setting.label} {options} value={offered ? value : CUSTOM} onchange={choose} />

{#if picking}
	<ColorPicker
		anchor={picking}
		label={t('settings-extensions-custom-color')}
		color={value.startsWith('#') ? value : (appearance.accent ?? '#808080')}
		chroma={CHROMA}
		onpick={onchange}
		onclose={() => (picking = null)}
	/>
{/if}
