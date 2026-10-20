<script lang="ts">
	import { t } from '@luft/i18n';
	import { session, type Failure, type Task } from '#lib/state/meet.svelte.js';

	const SAID: Record<Task, string> = {
		check: 'problem-check',
		room: 'problem-room',
		update: 'problem-update',
		download: 'problem-download',
		pack: 'problem-pack',
		remove: 'problem-remove',
		restart: 'problem-restart',
		tidy: 'problem-tidy',
		firmware: 'problem-firmware',
		folders: 'problem-folders',
		sticks: 'problem-sticks',
		stick: 'problem-stick',
		offer: 'problem-offer'
	};

	let { failure }: { failure: Failure } = $props();
	let said = $derived(
		failure.declined
			? t('problem-declined', { platform: session.platform })
			: failure.task === 'stick' && failure.detail
				? failure.detail
				: failure.task === 'room' && session.platform === 'linux'
					? t('problem-room-linux')
					: t(SAID[failure.task], { platform: session.platform })
	);
</script>

<div class="flex items-center gap-2 text-[13.5px]" role="alert">
	<span class="text-[var(--danger)]">{said}</span>
	<button type="button" class="plain-button shrink-0" onclick={() => failure.retry()}>{t('meet-try-again')}</button>
</div>
