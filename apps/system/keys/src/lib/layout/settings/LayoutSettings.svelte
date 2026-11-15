<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Select, TextField } from '@luft/ui';
	import type { AltGr, CapsLock, ComposeKey } from '#lib/bindings.js';
	import { keyNames } from '#lib/keyboard/names.js';
	import type { LayoutEditor } from '../editor.svelte';

	interface Props {
		editor: LayoutEditor;
		baseName: string;
	}

	let { editor, baseName }: Props = $props();

	const SHORT_LENGTH = 3;
	let names = $derived(keyNames());
	let altGrKeys: { value: AltGr; label: string }[] = $derived([
		{ value: 'ralt', label: names.rightAlt },
		{ value: 'lalt', label: names.leftAlt },
		{ value: 'alt', label: t('keys-settings-either-alt') },
		{ value: 'rctrl', label: names.rightCtrl },
		{ value: 'menu', label: names.menu },
		{ value: 'rwin', label: names.rightSuper },
		{ value: 'caps', label: names.capsLock }
	]);
	let composeKeys: { value: ComposeKey; label: string }[] = $derived([
		{ value: 'none', label: t('keys-settings-none') },
		{ value: 'ralt', label: names.rightAlt },
		{ value: 'rctrl', label: names.rightCtrl },
		{ value: 'menu', label: names.menu },
		{ value: 'rwin', label: names.rightSuper },
		{ value: 'caps', label: names.capsLock },
		{ value: 'sclk', label: names.scrollLock },
		{ value: 'prsc', label: names.printScreen }
	]);
	let capsActions: { value: CapsLock; label: string }[] = $derived([
		{ value: 'capslock', label: names.capsLock },
		{ value: 'shiftlock', label: names.shiftLock },
		{ value: 'escape', label: names.escape },
		{ value: 'swapescape', label: t('keys-settings-swap-escape') },
		{ value: 'backspace', label: names.backspace },
		{ value: 'ctrl', label: names.ctrl },
		{ value: 'none', label: t('keys-settings-nothing') }
	]);

	let options = $derived(editor.layout.options);
	let capsTaken = $derived(options.compose === 'caps' ? names.compose : editor.usesThirdLevel && options.altgr === 'caps' ? names.altGr : '');
</script>

<Section>
	<Row title={t('keys-name')}>
		<div class="w-[300px]">
			<TextField label={t('keys-name')} bind:value={() => editor.layout.name, (name) => editor.rename('name', name)} />
		</div>
	</Row>
	<Row title={t('keys-short-name')}>
		<div class="w-[120px]">
			<TextField label={t('keys-short-name')} bind:value={() => editor.layout.short, (short) => editor.rename('short', short.slice(0, SHORT_LENGTH))} />
		</div>
	</Row>
	<Row title={t('keys-language')}>
		<div class="w-[120px]">
			<TextField label={t('keys-language')} placeholder="de" bind:value={() => editor.layout.language, (language) => editor.rename('language', language.trim())} />
		</div>
	</Row>
</Section>

<Section>
	{#if editor.usesThirdLevel}
		<Row title={names.altGr}>
			<Select label={names.altGr} options={altGrKeys} value={options.altgr} onchange={(altgr) => editor.setOption('altgr', altgr)} />
		</Row>
	{/if}
	<Row title={names.compose}>
		<Select label={names.compose} options={composeKeys} value={options.compose} onchange={(compose) => editor.setOption('compose', compose)} />
	</Row>
	<Row title={names.capsLock}>
		{#if capsTaken}
			<span class="px-3">{t('keys-settings-works-as', { key: capsTaken })}</span>
		{:else}
			<Select label={names.capsLock} options={capsActions} value={options.caps} onchange={(caps) => editor.setOption('caps', caps)} />
		{/if}
	</Row>
	{#if baseName}
		<Row title={t('keys-settings-starts-from')}>
			<span class="max-w-[320px] truncate px-3">{baseName}</span>
		</Row>
	{/if}
</Section>
