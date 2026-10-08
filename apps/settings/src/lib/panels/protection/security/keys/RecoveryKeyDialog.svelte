<script lang="ts">
	import { Checkbox, Dialog, RecoveryKey } from '@luft/ui';
	import { printRecoveryKey, saveRecoveryKey } from '../api';

	interface Props {
		key: string;
		fresh?: boolean;
		description?: string;
		onclose: () => void;
	}

	const SHOWN = 'Type it if your computer ever asks for a recovery key at startup. Keep a copy somewhere other than this computer.';
	const FRESH = 'Your previous key no longer works. Keep this one on paper or in a password manager.';

	let { key, fresh = false, description = fresh ? FRESH : SHOWN, onclose }: Props = $props();

	let saved = $state(false);

	const close = () => (!fresh || saved) && onclose();
</script>

<Dialog title={fresh ? 'Save your new recovery key' : 'Your recovery key'} {description} wide onclose={close}>
	<RecoveryKey {key} onsave={() => saveRecoveryKey(key)} onprint={() => printRecoveryKey(key)} />
	{#if fresh}
		<Checkbox label="I’ve saved my recovery key" checked={saved} onchange={(checked) => (saved = checked)}>I’ve saved my recovery key</Checkbox>
	{/if}
	{#snippet actions()}
		<button type="button" class="button primary" disabled={fresh && !saved} onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
