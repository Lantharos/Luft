<script lang="ts">
	import type { Snippet } from 'svelte';
	import { AppIcon, ItemRow } from '@luft/ui';
	import type { App } from './api';

	let { app, description, children }: { app: App; description?: string; children: Snippet } = $props();
</script>

<ItemRow title={app.name} {description}>
	{#snippet leading()}
		<AppIcon icon={app.icon} id={app.id} size={28} />
	{/snippet}
	{@render children()}
</ItemRow>
