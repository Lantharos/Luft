<script lang="ts">
	import { Row, Section, Select, TextField } from '@luft/ui';
	import type { AltGr, CapsLock, ComposeKey } from '../api';
	import type { LayoutEditor } from '../editor.svelte';

	interface Props {
		editor: LayoutEditor;
		baseName: string;
	}

	let { editor, baseName }: Props = $props();

	const SHORT_LENGTH = 3;
	const ALTGR: { value: AltGr; label: string }[] = [
		{ value: 'ralt', label: 'Right Alt' },
		{ value: 'lalt', label: 'Left Alt' },
		{ value: 'alt', label: 'Either Alt' },
		{ value: 'rctrl', label: 'Right Ctrl' },
		{ value: 'menu', label: 'Menu' },
		{ value: 'rwin', label: 'Right Super' },
		{ value: 'caps', label: 'Caps Lock' }
	];
	const COMPOSE: { value: ComposeKey; label: string }[] = [
		{ value: 'none', label: 'None' },
		{ value: 'ralt', label: 'Right Alt' },
		{ value: 'rctrl', label: 'Right Ctrl' },
		{ value: 'menu', label: 'Menu' },
		{ value: 'rwin', label: 'Right Super' },
		{ value: 'caps', label: 'Caps Lock' },
		{ value: 'sclk', label: 'Scroll Lock' },
		{ value: 'prsc', label: 'Print Screen' }
	];
	const CAPS: { value: CapsLock; label: string }[] = [
		{ value: 'capslock', label: 'Caps Lock' },
		{ value: 'shiftlock', label: 'Shift Lock' },
		{ value: 'escape', label: 'Escape' },
		{ value: 'swapescape', label: 'Swapped with Escape' },
		{ value: 'backspace', label: 'Backspace' },
		{ value: 'ctrl', label: 'Ctrl' },
		{ value: 'none', label: 'Nothing' }
	];

	let options = $derived(editor.layout.options);
	let capsTaken = $derived(options.compose === 'caps' ? 'Compose' : editor.usesThirdLevel && options.altgr === 'caps' ? 'AltGr' : '');
</script>

<Section>
	<Row title="Name">
		<div class="w-[300px]">
			<TextField label="Name" bind:value={() => editor.layout.name, (name) => editor.rename('name', name)} />
		</div>
	</Row>
	<Row title="Short name">
		<div class="w-[120px]">
			<TextField label="Short name" bind:value={() => editor.layout.short, (short) => editor.rename('short', short.slice(0, SHORT_LENGTH))} />
		</div>
	</Row>
	<Row title="Language">
		<div class="w-[120px]">
			<TextField label="Language" placeholder="de" bind:value={() => editor.layout.language, (language) => editor.rename('language', language.trim())} />
		</div>
	</Row>
</Section>

<Section>
	{#if editor.usesThirdLevel}
		<Row title="AltGr">
			<Select label="AltGr" options={ALTGR} value={options.altgr} onchange={(altgr) => editor.setOption('altgr', altgr)} />
		</Row>
	{/if}
	<Row title="Compose">
		<Select label="Compose" options={COMPOSE} value={options.compose} onchange={(compose) => editor.setOption('compose', compose)} />
	</Row>
	<Row title="Caps Lock">
		{#if capsTaken}
			<span class="px-3">Works as {capsTaken}</span>
		{:else}
			<Select label="Caps Lock" options={CAPS} value={options.caps} onchange={(caps) => editor.setOption('caps', caps)} />
		{/if}
	</Row>
	{#if baseName}
		<Row title="Starts from">
			<span class="max-w-[320px] truncate px-3">{baseName}</span>
		</Row>
	{/if}
</Section>
