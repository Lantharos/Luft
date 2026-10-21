<script lang="ts">
	import { AppIcon } from '@luft/ui';
	import * as api from '#lib/bridge/index.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import type { AppChoice, OpenWithApps } from '#lib/types/details.js';

	interface Props {
		apps: OpenWithApps;
		path: string;
		manager: FileManager;
	}

	let { apps, path, manager }: Props = $props();

	const COLLAPSED_COUNT = 3;

	let expanded = $state(false);
	let others = $derived(expanded ? apps.others : apps.others.slice(0, COLLAPSED_COUNT));

	function open(app: AppChoice) {
		api.openWithApp(path, app.id).catch(manager.notify);
	}
</script>

{#snippet choice(app: AppChoice, primary: boolean)}
	<button class={['open-with__app', primary && 'is-default']} type="button" onclick={() => open(app)}>
		<AppIcon icon={app.icon} id={app.id} size={primary ? 28 : 22} />
		<span class="min-w-0 flex-1 truncate">{app.name}</span>
		{#if primary}
			<span class="text-[12px] text-[var(--text-muted)]">Open</span>
		{/if}
	</button>
{/snippet}

{#if apps.default || apps.others.length > 0}
	<section class="details-section" aria-label="Open with">
		<p class="details-heading">Open with</p>
		{#if apps.default}
			{@render choice(apps.default, true)}
		{/if}
		{#each others as app (app.id)}
			{@render choice(app, false)}
		{/each}
		{#if apps.others.length > COLLAPSED_COUNT}
			<button class="plain-button self-start" type="button" onclick={() => (expanded = !expanded)}>
				{expanded ? 'Show fewer' : `${apps.others.length - COLLAPSED_COUNT} more`}
			</button>
		{/if}
	</section>
{/if}

<style>
	.details-section {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.details-heading {
		padding-bottom: 6px;
		color: var(--text-muted);
		font-size: 12.5px;
	}

	.open-with__app {
		display: flex;
		min-height: 36px;
		align-items: center;
		gap: 10px;
		border-radius: 10px;
		padding-inline: 8px;
		margin-inline: -8px;
		color: var(--text-soft);
		font-size: 13px;
		text-align: left;
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate);
	}

	.open-with__app:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.open-with__app.is-default {
		min-height: 44px;
		color: var(--text);
	}
</style>
