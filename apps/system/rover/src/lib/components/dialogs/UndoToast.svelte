<script lang="ts">
	import { t } from '@luft/i18n';
	import { Toast, type ToastMessage } from '@luft/ui';
	import { history } from '#lib/features/history.svelte.js';

	let toast = $derived.by((): ToastMessage | null => {
		const current = history.toast;
		if (!current) return null;
		const failed = current.kind === 'failed';
		const action =
			failed || current.kind === 'info' || current.kind === 'working' ? null : current.kind === 'undone' ? { label: t('rover-history-redo'), run: history.redo } : { label: t('rover-history-undo'), run: history.undo };

		return { id: current.id, message: current.message, failed, busy: current.kind === 'working', action };
	});
</script>

<Toast class="bottom-11" {toast} ondismiss={history.dismiss} onhold={history.hold} onrelease={history.release} />
