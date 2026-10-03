<script lang="ts">
	import AppArt from '#lib/components/AppArt.svelte';
	import type { AppDetails } from '#lib/catalog/types.js';
	import { navigation } from '#lib/state/navigation.svelte.js';

	let { app }: { app: AppDetails } = $props();
	const shot = $derived(app.screenshots[0]);
</script>

<button
	type="button"
	class="spotlight"
	onclick={() => navigation.push({ page: 'app', target: { origin: app.origin, id: app.id }, name: app.name })}
>
	<div class="flex min-w-0 flex-1 flex-col items-start gap-3">
		<AppArt icon={app.icon} size={64} />
		<div class="flex flex-col gap-1">
			<span class="text-[24px] font-semibold">{app.name}</span>
			<span class="text-[14px] text-[var(--text-soft)]">{app.summary}</span>
		</div>
		{#if app.developer}
			<span class="text-[13px] text-[var(--text-muted)]">{app.developer}</span>
		{/if}
	</div>
	{#if shot}
		<img src={shot.url} alt="" loading="lazy" decoding="async" />
	{/if}
</button>

<style>
	.spotlight {
		display: flex;
		height: 240px;
		align-items: center;
		gap: 28px;
		overflow: hidden;
		border-radius: 22px;
		background: var(--surface);
		padding: 28px 0 28px 32px;
		text-align: left;
		transition: background-color 180ms var(--ease), transform 180ms var(--ease);
	}

	.spotlight:hover {
		background: var(--surface-hover);
	}

	.spotlight:active {
		transform: scale(0.99);
	}

	img {
		height: calc(100% + 24px);
		max-width: 58%;
		align-self: flex-end;
		margin-bottom: -52px;
		border-radius: 12px 0 0 0;
		object-fit: cover;
		object-position: left top;
		box-shadow: 0 12px 40px var(--shadow-faint);
	}
</style>
