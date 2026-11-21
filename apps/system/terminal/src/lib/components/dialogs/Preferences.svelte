<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import { Dialog, Row, Section, Segmented, Select, Slider, Switch, appearance } from '@luft/ui';
	import type { CursorStyle, SchemePreference } from '#lib/bindings.js';
	import { FONT_SIZES, settings } from '#lib/state/settings.svelte.js';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let schemes: { value: SchemePreference; label: string }[] = $derived([
		{ value: 'system', label: t('terminal-style-desktop') },
		{ value: 'light', label: t('terminal-style-light') },
		{ value: 'dark', label: t('terminal-style-dark') }
	]);

	let cursors: { value: CursorStyle; label: string }[] = $derived([
		{ value: 'block', label: t('terminal-cursor-block') },
		{ value: 'bar', label: t('terminal-cursor-bar') },
		{ value: 'underline', label: t('terminal-cursor-underline') }
	]);

	let scrollback = $derived(
		[1_000, 5_000, 10_000, 50_000, 100_000].map((lines) => ({
			value: lines,
			label: t('terminal-history-lines', { count: lines })
		}))
	);

	let percent = $derived(new Intl.NumberFormat(i18n.formats, { style: 'percent', maximumFractionDigits: 0 }));

	const DEFAULT_SHELL = '';

	let shellName = $derived(settings.defaultShell.split('/').at(-1));
	let shells = $derived([
		{ value: DEFAULT_SHELL, label: t('terminal-shell-default', { shell: shellName ?? '' }) },
		...settings.shells.map((shell) => ({ value: shell, label: shell }))
	]);
	let pendingTranslucency = $derived(appearance.translucent && settings.current.translucent && !settings.glass);
</script>

<Dialog title={t('terminal-preferences')} wide {onclose}>
	<Section title={t('terminal-appearance')}>
		<Row title={t('terminal-style')}>
			<Segmented label={t('terminal-style')} options={schemes} value={settings.current.scheme} onchange={(scheme) => settings.update({ scheme })} />
		</Row>
		{#if appearance.translucent}
			<Row
				title={t('terminal-translucent')}
				description={pendingTranslucency ? t('terminal-translucent-pending') : t('terminal-translucent-description')}
			>
				<Switch label={t('terminal-translucent')} checked={settings.current.translucent} onchange={(translucent) => settings.update({ translucent })} />
			</Row>
			{#if settings.translucent}
				<Row title={t('terminal-opacity')}>
					{#snippet below()}
						<Slider
							label={t('terminal-opacity')}
							value={settings.current.opacity}
							min={0.5}
							max={1}
							step={0.01}
							format={(value) => percent.format(value)}
							oninput={(opacity) => (settings.current.opacity = opacity)}
							onchange={(opacity) => settings.update({ opacity })}
						/>
					{/snippet}
				</Row>
			{/if}
		{/if}
		<Row title={t('terminal-text-size')}>
			{#snippet below()}
				<Slider
					label={t('terminal-text-size')}
					value={settings.current.fontSize}
					min={FONT_SIZES.min}
					max={FONT_SIZES.max}
					step={1}
					format={(value) => t('terminal-text-size-points', { size: value })}
					onchange={(fontSize) => settings.update({ fontSize })}
				/>
			{/snippet}
		</Row>
	</Section>

	<Section title={t('terminal-cursor')}>
		<Row title={t('terminal-cursor-shape')}>
			<Segmented label={t('terminal-cursor-shape-label')} options={cursors} value={settings.current.cursorStyle} onchange={(cursorStyle) => settings.update({ cursorStyle })} />
		</Row>
		<Row title={t('terminal-cursor-blink')}>
			<Switch label={t('terminal-cursor-blink')} checked={settings.current.cursorBlink} onchange={(cursorBlink) => settings.update({ cursorBlink })} />
		</Row>
	</Section>

	<Section title={t('terminal-behavior')}>
		<Row title={t('terminal-shell')} description={t('terminal-shell-description')}>
			<Select label={t('terminal-shell')} options={shells} value={settings.current.shell ?? DEFAULT_SHELL} onchange={(shell) => settings.update({ shell: shell || null })} />
		</Row>
		<Row title={t('terminal-history')} description={t('terminal-history-description')}>
			<Select label={t('terminal-history')} options={scrollback} value={settings.current.scrollback} onchange={(scrollback) => settings.update({ scrollback })} />
		</Row>
		<Row title={t('terminal-copy-on-select')}>
			<Switch label={t('terminal-copy-on-select')} checked={settings.current.copyOnSelect} onchange={(copyOnSelect) => settings.update({ copyOnSelect })} />
		</Row>
		<Row title={t('terminal-clipboard-reads')} description={t('terminal-clipboard-reads-description')}>
			<Switch label={t('terminal-clipboard-reads')} checked={settings.current.clipboardReads} onchange={(clipboardReads) => settings.update({ clipboardReads })} />
		</Row>
	</Section>

	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('terminal-done')}</button>
	{/snippet}
</Dialog>
