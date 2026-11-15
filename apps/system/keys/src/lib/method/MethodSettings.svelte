<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Select, Switch, TextField } from '@luft/ui';
	import { keyNames } from '#lib/keyboard/names.js';
	import type { MethodEditor } from './editor.svelte';

	interface Props {
		editor: MethodEditor;
	}

	let { editor }: Props = $props();

	const PAGE_SIZES = [5, 7, 9].map((size) => ({ value: size, label: String(size) }));
	const composeKeys = $derived([
		{ value: '', label: t('keys-settings-none') },
		{ value: 'Multi_key', label: keyNames().compose },
		{ value: 'grave', label: '`' },
		{ value: 'semicolon', label: ';' },
		{ value: 'backslash', label: '\\' }
	]);
	const LABEL_LENGTH = 3;
</script>

<Section>
	<Row title={t('keys-name')}>
		<div class="w-[280px]">
			<TextField label={t('keys-name')} bind:value={() => editor.method.name, (name) => editor.set('name', name)} />
		</div>
	</Row>
	<Row title={t('keys-short-name')}>
		<div class="w-[120px]">
			<TextField label={t('keys-short-name')} bind:value={() => editor.method.label, (label) => editor.set('label', label.slice(0, LABEL_LENGTH))} />
		</div>
	</Row>
	<Row title={t('keys-language')}>
		<div class="w-[120px]">
			<TextField label={t('keys-language')} placeholder="eo" bind:value={() => editor.method.language, (language) => editor.set('language', language.trim())} />
		</div>
	</Row>
	<Row title={t('keys-method-sequence-key')}>
		<Select label={t('keys-method-sequence-key')} options={composeKeys} value={editor.method.compose} onchange={(compose) => editor.set('compose', compose)} />
	</Row>
	{#if editor.words.length}
		<Row title={t('keys-method-page-size')}>
			<div class="w-[160px]">
				<Segmented label={t('keys-method-page-size')} options={PAGE_SIZES} value={editor.method.candidates} onchange={(size) => editor.set('candidates', size)} />
			</div>
		</Row>
		<Row title={t('keys-method-learn')}>
			<Switch label={t('keys-method-learn')} checked={editor.method.learn} onchange={(learn) => editor.set('learn', learn)} />
		</Row>
	{/if}
</Section>
