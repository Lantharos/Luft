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
		{ value: 'system', label: t('tern-style-desktop') },
		{ value: 'light', label: t('tern-style-light') },
		{ value: 'dark', label: t('tern-style-dark') }
	]);

	let cursors: { value: CursorStyle; label: string }[] = $derived([
		{ value: 'block', label: t('tern-cursor-block') },
		{ value: 'bar', label: t('tern-cursor-bar') },
		{ value: 'underline', label: t('tern-cursor-underline') }
	]);

	let scrollback = $derived(
		[1_000, 5_000, 10_000, 50_000, 100_000].map((lines) => ({
			value: lines,
			label: t('tern-history-lines', { count: lines })
		}))
	);

	let percent = $derived(new Intl.NumberFormat(i18n.formats, { style: 'percent', maximumFractionDigits: 0 }));

	const DEFAULT_SHELL = '';

	let shellName = $derived(settings.defaultShell.split('/').at(-1));
	let shells = $derived([
		{ value: DEFAULT_SHELL, label: t('tern-shell-default', { shell: shellName ?? '' }) },
		...settings.shells.map((shell) => ({ value: shell, label: shell }))
	]);
	let pendingTranslucency = $derived(appearance.translucent && settings.current.translucent && !settings.glass);
</script>

<Dialog title={t('tern-preferences')} wide {onclose}>
	<Section title={t('tern-appearance')}>
		<Row title={t('tern-style')}>
			<Segmented label={t('tern-style')} options={schemes} value={settings.current.scheme} onchange={(scheme) => settings.update({ scheme })} />
		</Row>
		{#if appearance.translucent}
			<Row
				title={t('tern-translucent')}
				description={pendingTranslucency ? t('tern-translucent-pending') : t('tern-translucent-description')}
			>
				<Switch label={t('tern-translucent')} checked={settings.current.translucent} onchange={(translucent) => settings.update({ translucent })} />
			</Row>
			{#if settings.translucent}
				<Row title={t('tern-opacity')}>
					{#snippet below()}
						<Slider
							label={t('tern-opacity')}
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
		<Row title={t('tern-text-size')}>
			{#snippet below()}
				<Slider
					label={t('tern-text-size')}
					value={settings.current.fontSize}
					min={FONT_SIZES.min}
					max={FONT_SIZES.max}
					step={1}
					format={(value) => t('tern-text-size-points', { size: value })}
					onchange={(fontSize) => settings.update({ fontSize })}
				/>
			{/snippet}
		</Row>
	</Section>

	<Section title={t('tern-cursor')}>
		<Row title={t('tern-cursor-shape')}>
			<Segmented label={t('tern-cursor-shape-label')} options={cursors} value={settings.current.cursorStyle} onchange={(cursorStyle) => settings.update({ cursorStyle })} />
		</Row>
		<Row title={t('tern-cursor-blink')}>
			<Switch label={t('tern-cursor-blink')} checked={settings.current.cursorBlink} onchange={(cursorBlink) => settings.update({ cursorBlink })} />
		</Row>
	</Section>

	<Section title={t('tern-behavior')}>
		<Row title={t('tern-shell')} description={t('tern-shell-description')}>
			<Select label={t('tern-shell')} options={shells} value={settings.current.shell ?? DEFAULT_SHELL} onchange={(shell) => settings.update({ shell: shell || null })} />
		</Row>
		<Row title={t('tern-history')} description={t('tern-history-description')}>
			<Select label={t('tern-history')} options={scrollback} value={settings.current.scrollback} onchange={(scrollback) => settings.update({ scrollback })} />
		</Row>
		<Row title={t('tern-copy-on-select')}>
			<Switch label={t('tern-copy-on-select')} checked={settings.current.copyOnSelect} onchange={(copyOnSelect) => settings.update({ copyOnSelect })} />
		</Row>
		<Row title={t('tern-clipboard-reads')} description={t('tern-clipboard-reads-description')}>
			<Switch label={t('tern-clipboard-reads')} checked={settings.current.clipboardReads} onchange={(clipboardReads) => settings.update({ clipboardReads })} />
		</Row>
	</Section>

	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('tern-done')}</button>
	{/snippet}
</Dialog>
