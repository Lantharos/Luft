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
</script>

<Section>
	<Row title="Name">
		<div class="w-[280px]">
			<TextField label="Name" bind:value={() => editor.method.name, (name) => editor.set('name', name)} />
		</div>
	</Row>
	<Row title="Short name">
		<div class="w-[120px]">
			<TextField label="Short name" bind:value={() => editor.method.label, (label) => editor.set('label', label.slice(0, LABEL_LENGTH))} />
		</div>
	</Row>
	<Row title="Language">
		<div class="w-[120px]">
			<TextField label="Language" placeholder="eo" bind:value={() => editor.method.language, (language) => editor.set('language', language.trim())} />
		</div>
	</Row>
	<Row title="Sequence key">
		<Select label="Sequence key" options={COMPOSE_KEYS} value={editor.method.compose} onchange={(compose) => editor.set('compose', compose)} />
	</Row>
	{#if editor.words.length}
		<Row title="Choices shown at once">
			<div class="w-[160px]">
				<Segmented label="Choices shown at once" options={PAGE_SIZES} value={editor.method.candidates} onchange={(size) => editor.set('candidates', size)} />
			</div>
		</Row>
		<Row title="Learn from your choices">
			<Switch label="Learn from your choices" checked={editor.method.learn} onchange={(learn) => editor.set('learn', learn)} />
		</Row>
	{/if}
</Section>
