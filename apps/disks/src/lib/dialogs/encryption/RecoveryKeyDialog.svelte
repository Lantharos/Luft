<script lang="ts">
	import { Dialog, RecoveryKey } from '@luft/ui';
	import * as api from '$lib/api';

	interface Props {
		key: string;
		name: string;
		onclose: () => void;
	}

	let { key, name, onclose }: Props = $props();
</script>

<Dialog title="Recovery key for “{name}”" description="Type it if the drive ever asks for a recovery key. Keep a copy somewhere other than the drive and this computer." wide {onclose}>
	<RecoveryKey {key} onsave={() => api.trust.saveKey(key, name)} onprint={() => api.trust.printKey(key, name)} />
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
