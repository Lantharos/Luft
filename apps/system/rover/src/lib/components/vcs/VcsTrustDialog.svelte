<script lang="ts">
	import { t } from '@luft/i18n';
	import { basename, ConfirmDialog } from '@luft/ui';
	import type { VcsState } from '#lib/vcs/state.svelte.js';

	interface Props {
		vcs: VcsState;
	}

	let { vcs }: Props = $props();
</script>

{#if vcs.asking && vcs.untrusted}
	<ConfirmDialog
		title={t('rover-vcs-trust-title', { folder: basename(vcs.untrusted) })}
		description={t('rover-vcs-trust-description')}
		action={t('rover-vcs-trust-confirm')}

		run={vcs.trust}
		onclose={() => (vcs.asking = false)}
	/>
{/if}
