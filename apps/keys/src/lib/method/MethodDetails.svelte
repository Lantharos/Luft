<script lang="ts">
	import { Row, Section, Segmented, Select, Switch, TextField } from '@luft/ui';
	import type { MethodEditor } from './editor.svelte';

	interface Props {
		editor: MethodEditor;
	}

	let { editor }: Props = $props();

	const PAGE_SIZES = [5, 7, 9].map((size) => ({ value: size, label: String(size) }));
	const COMPOSE_KEYS = [
		{ value: '', label: 'None' },
		{ value: 'Multi_key', label: 'Compose' },
		{ value: 'grave', label: '`' },
		{ value: 'semicolon', label: ';' },
		{ value: 'backslash', label: '\\' }
	];
	const LABEL_LENGTH = 3;

	function set<K extends 'name' | 'label' | 'language' | 'candidates' | 'learn' | 'compose'>(key: K, value: (typeof editor.method)[K]) {
		editor.method[key] = value;
		editor.changed();
	}
</script>

<Section title="Details">
	<Row title="Name">
		<div class="w-[280px]">
			<TextField label="Name" bind:value={() => editor.method.name, (name) => set('name', name)} />
		</div>
	</Row>
	<Row title="Short name" description="Shown on the panel while you type with it">
		<div class="w-[120px]">
			<TextField label="Short name" bind:value={() => editor.method.label, (label) => set('label', label.slice(0, LABEL_LENGTH))} />
		</div>
	</Row>
	<Row title="Language" description="Its code, such as eo for Esperanto or zh for Chinese">
		<div class="w-[120px]">
			<TextField label="Language" bind:value={() => editor.method.language, (language) => set('language', language.trim())} />
		</div>
	</Row>
	<Row title="Sequence key" description="Press it, then a sequence below, to type what the sequence makes">
		<Select label="Sequence key" options={COMPOSE_KEYS} value={editor.method.compose} onchange={(compose) => set('compose', compose)} />
	</Row>
	{#if editor.words.length}
		<Row title="Choices shown at once">
			<div class="w-[160px]">
				<Segmented label="Choices shown at once" options={PAGE_SIZES} value={editor.method.candidates} onchange={(size) => set('candidates', size)} />
			</div>
		</Row>
		<Row title="Learn from your choices" description="Words you pick often move to the top">
			<Switch label="Learn from your choices" checked={editor.method.learn} onchange={(learn) => set('learn', learn)} />
		</Row>
	{/if}
</Section>
