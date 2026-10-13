<script lang="ts">
	import { Dialog } from '@luft/ui';
	import type { Release } from '../api';
	import { versionName } from '../headline';

	let { release, onclose }: { release: Release; onclose: () => void } = $props();
</script>

<Dialog title="What's new in {versionName(release).toLowerCase()}" {onclose}>
	<p class="soft-scroll max-h-[360px] overflow-y-auto text-[14px] leading-relaxed whitespace-pre-line text-[var(--text-soft)]">{release.notes}</p>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
