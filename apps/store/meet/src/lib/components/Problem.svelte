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
		offer: 'problem-offer',
		luft: 'problem-luft',
		resize: 'problem-resize',
		cancel: 'problem-cancel',
		give: 'problem-give',
		open: 'problem-open'
	};
	const EXPLAINED: Task[] = ['luft', 'resize', 'cancel', 'give', 'open'];

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
	let why = $derived(!failure.declined && EXPLAINED.includes(failure.task) ? failure.detail : undefined);
</script>

<div class="flex items-start gap-2 text-[13.5px]" role="alert">
	<div class="flex min-w-0 flex-col gap-1">
		<span class="text-[var(--danger)]">{said}</span>
		{#if why}
			<span class="leading-relaxed text-[var(--text-soft)]">{why}</span>
		{/if}
	</div>
	<button type="button" class="plain-button shrink-0" onclick={() => failure.retry()}>{t('meet-try-again')}</button>
</div>
