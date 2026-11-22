<script lang="ts">
	import { t } from '@luft/i18n';
	import type { CheckedSource } from '#lib/bindings.js';

	let { source }: { source: CheckedSource } = $props();

	function grouped(fingerprint: string) {
		const groups = fingerprint.match(/.{1,4}/g) ?? [];
		const half = Math.ceil(groups.length / 2);
		return `${groups.slice(0, half).join(' ')}  ${groups.slice(half).join(' ')}`;
	}
</script>

<div class="flex flex-col gap-2">
	{#each source.described.sources as entry (entry.id)}
		<div class="flex min-w-0 flex-col">
			<span class="font-medium">{entry.name}</span>
			<span class="truncate text-[var(--text-muted)]">{entry.url}</span>
		</div>
	{/each}
</div>
<div class="flex flex-col gap-2">
	<span class="text-[var(--text-muted)]">{t('source-trust-keys', { count: source.described.keys.length })}</span>
	{#each source.described.keys as key (key.fingerprint)}
		<div class="flex min-w-0 flex-col">
			<span class="truncate">{key.user}</span>
			<span class="fingerprint select-text">{grouped(key.fingerprint)}</span>
		</div>
	{/each}
</div>

<style>
	.fingerprint {
		font-family: var(--font-mono);
		font-size: 12.5px;
		white-space: pre;
		color: var(--text-soft);
	}
</style>
