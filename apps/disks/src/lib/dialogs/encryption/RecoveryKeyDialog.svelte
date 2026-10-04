<script lang="ts">
	import { Dialog, RecoveryKey } from '@luft/ui';
	import * as api from '#lib/api.js';

	interface Props {
		key: string;
		name: string;
		onclose: () => void;
	}

	let { key, name, onclose }: Props = $props();
</script>

<Dialog title="Recovery key for “{name}”" description="Keep a copy somewhere other than this drive and computer." wide {onclose}>
	<RecoveryKey {key} onsave={() => api.trust.saveKey(key, name)} onprint={() => api.trust.printKey(key, name)} />
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
