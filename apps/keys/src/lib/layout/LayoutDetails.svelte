<script lang="ts">
	import { Row, Section, TextField } from '@luft/ui';
	import type { LayoutEditor } from './editor.svelte';

	interface Props {
		editor: LayoutEditor;
		baseName: string;
	}

	let { editor, baseName }: Props = $props();

	const SHORT_LENGTH = 3;
</script>

<Section title="Details">
	<Row title="Name">
		<div class="w-[300px]">
			<TextField label="Name" bind:value={() => editor.layout.name, (name) => ((editor.layout.name = name), editor.changed())} />
		</div>
	</Row>
	<Row title="Short name" description="Shown on the panel while you type with it">
		<div class="w-[120px]">
			<TextField
				label="Short name"
				bind:value={() => editor.layout.short, (short) => ((editor.layout.short = short.slice(0, SHORT_LENGTH)), editor.changed())}
			/>
		</div>
	</Row>
	{#if baseName}
		<Row title="Keys you haven't changed" description="Everything outside the keys above, such as the number pad, works like {baseName}" />
	{/if}
</Section>
