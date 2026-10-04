<script lang="ts">
	import { appearance, Row, Section } from '@luft/ui';
	import FontPicker from './FontPicker.svelte';
	import { fontLibrary } from './library.svelte';

	interface Props {
		onbrowse: () => void;
	}

	let { onbrowse }: Props = $props();

	let problem = $state('');

	void fontLibrary.load();
</script>

<Section title="Fonts">
	<Row title="Interface" description="Menus, buttons and text across the desktop and apps">
		<FontPicker role="interface" label="Interface font" family={appearance.typography.interface ?? fontLibrary.defaults?.interface ?? ''} onerror={(message) => (problem = message)} />
	</Row>
	<Row title="Monospace" description="Terminals, code and anything that lines up in columns">
		<FontPicker role="monospace" label="Monospace font" family={appearance.typography.monospace ?? fontLibrary.defaults?.monospace ?? ''} onerror={(message) => (problem = message)} />
	</Row>
	<Row title="All fonts" description="Preview the fonts on this computer, use one or remove ones you added" onclick={onbrowse} />
</Section>
{#if problem}
	<p class="-mt-3 px-1.5 text-[13px] text-[var(--danger)]">{problem}</p>
{/if}
