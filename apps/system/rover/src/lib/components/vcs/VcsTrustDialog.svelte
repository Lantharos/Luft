<script lang="ts">
	import { basename, ConfirmDialog } from '@luft/ui';
	import type { VcsState } from '#lib/vcs/state.svelte.js';

	interface Props {
		vcs: VcsState;
	}

	let { vcs }: Props = $props();
</script>

{#if vcs.asking && vcs.untrusted}
	<ConfirmDialog
		title={`Show Git status for “${basename(vcs.untrusted)}”?`}
		description="Git follows this folder’s own settings, which can run programs. Only do this for folders that came from someone you trust."
		action="Show status"
		run={vcs.trust}
		onclose={() => (vcs.asking = false)}
	/>
{/if}
