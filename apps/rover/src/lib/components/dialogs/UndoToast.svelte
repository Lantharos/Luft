<script lang="ts">
	import { Toast, type ToastMessage } from '@luft/ui';
	import { history } from '#lib/features/history.svelte.js';

	let toast = $derived.by((): ToastMessage | null => {
		const current = history.toast;
		if (!current) return null;
		const failed = current.kind === 'failed';
		const action =
			failed || current.kind === 'info' ? null : current.kind === 'undone' ? { label: 'Redo', run: history.redo } : { label: 'Undo', run: history.undo };
		return { id: current.id, message: current.message, failed, action };
	});
</script>

<Toast class="bottom-11" {toast} ondismiss={history.dismiss} onhold={history.hold} onrelease={history.release} />
