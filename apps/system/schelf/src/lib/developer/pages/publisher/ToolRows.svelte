<script lang="ts">
	import { Row } from '@luft/ui';
	import CopyLine from '../../components/CopyLine.svelte';
	import type { ProjectTool, ShortNameState } from '../../store';

	const SHORT: Record<ShortNameState, string> = {
		resolves: 'Installs by its short name too',
		paused: 'Its short name works again once the publisher is verified',
		free: 'Its short name is free to claim',
		taken: 'Its short name belongs to another publisher',
		reserved: 'Its short name is kept for the system'
	};

	let { tool, description }: { tool: ProjectTool; description?: string } = $props();
</script>

<Row title={tool.name} description={description ?? `${tool.address} · ${SHORT[tool.short]}`}>
	{#snippet below()}
		<CopyLine text={tool.install} label="Copy the install line" />
		<CopyLine text={tool.add} label="Copy the schelf line" />
	{/snippet}
</Row>
