<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';
	import { IconButton, Segmented, WindowControls } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { queue } from '#lib/state/queue.svelte.js';
	import { session, type View } from '#lib/state/session.svelte.js';

	const title = $derived.by(() => {
		if (session.view === 'queue') return t('queue-title');
		if (session.files.length === 1) return session.files[0].name;
		if (session.files.length) return t('header-files', { count: session.files.length });
		return 'Convertible';
	});
	const editable = $derived(['image', 'video', 'audio'].includes(session.current?.family ?? ''));
	const modes = $derived<{ value: View; label: string }[]>([
		{ value: 'convert', label: t('mode-convert') },
		{ value: 'edit', label: t('mode-edit') }
	]);
	const busy = $derived(queue.active.length);

	function close() {
		if (busy) session.closing = true;
		else appWindow.close();
	}

	async function add() {
		await session.open(await commands.chooseFiles());
	}
</script>

<header class="drag-region flex h-[52px] shrink-0 items-center gap-2 pl-4 pr-3">
	<h1 class="min-w-0 flex-1 truncate text-[14px] font-semibold">{title}</h1>
	<div class="flex items-center gap-1" data-no-drag>
		{#if session.files.length && editable && session.view !== 'queue'}
			<div class="w-[176px]">
				<Segmented label={t('mode-label')} options={modes} value={session.view} onchange={(value) => (session.view = value)} />
			</div>
		{/if}
		{#if session.files.length && !session.single}
			<IconButton icon={Plus} label={t('header-add')} onclick={add} />
		{/if}
		{#if session.files.length && session.view !== 'queue'}
			<IconButton icon={X} label={t('header-clear')} onclick={() => session.clear()} />
		{/if}
		{#if queue.items.length}
			<button
				type="button"
				class="icon-button queue"
				aria-label={t('header-queue', { count: busy })}
				aria-pressed={session.view === 'queue'}
				style:--done={queue.fraction}
				class:busy={busy > 0}
				onclick={() => (session.view = session.view === 'queue' ? 'convert' : 'queue')}
			>
				<ListChecks size={18} />
			</button>
		{/if}
	</div>
	<div class="ml-2"><WindowControls onclose={close} /></div>
</header>

<style>
	.queue {
		position: relative;
	}

	.queue.busy::after {
		content: '';
		position: absolute;
		left: 6px;
		bottom: 3px;
		width: calc((100% - 12px) * var(--done));
		height: 2px;
		border-radius: 1px;
		background: var(--accent);
	}
</style>
