<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row } from '@luft/ui';
	import CopyLine from '../../components/CopyLine.svelte';
	import type { ProjectTool, ShortNameState } from '../../store';

	const SHORT: Record<ShortNameState, string> = {
		resolves: 'developer-tools-short-resolves',
		paused: 'developer-tools-short-paused',
		free: 'developer-tools-short-free',
		taken: 'developer-tools-short-taken',
		reserved: 'developer-tools-short-reserved'
	};

	let { tool, description }: { tool: ProjectTool; description?: string } = $props();
</script>

<Row title={tool.name} description={description ?? t('developer-tools-facts', { address: tool.address, short: t(SHORT[tool.short]) })}>
	{#snippet below()}
		<CopyLine text={tool.install} label={t('developer-tools-copy-install')} />
		<CopyLine text={tool.add} label={t('developer-tools-copy-schelf')} />
	{/snippet}
</Row>
