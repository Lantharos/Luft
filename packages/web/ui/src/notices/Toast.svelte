<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import type { ClassValue } from 'svelte/elements';
	import { t } from '@luft/i18n';
	import Dialog from '../dialogs/Dialog.svelte';
	import { toast as presence } from '../motion/transitions';
	import Spinner from './Spinner.svelte';
	import { swipeAway } from './swipe';
	import type { ToastDetail, ToastMessage } from './toasts.svelte';

	interface Props {
		toast: ToastMessage | null;
		dismissible?: boolean;
		class?: ClassValue;
		ondismiss: () => void;
		onhold?: () => void;
		onrelease?: () => void;
	}

	let { toast, dismissible = false, class: className, ondismiss, onhold, onrelease }: Props = $props();

	let shown = $derived(toast ? [toast] : []);
	let reading = $state<ToastDetail | null>(null);

	function leave(node: Element, params: undefined, options: { direction: 'in' | 'out' | 'both' }) {
		return node instanceof HTMLElement && 'swiped' in node.dataset ? { duration: 0 } : presence(node, params, options);
	}

	function dismiss(item: ToastMessage) {
		if (toast?.id === item.id) ondismiss();
	}

	function act(item: ToastMessage, run: () => unknown) {
		dismiss(item);
		void run();
	}
</script>

<div class={['toast-region', className]} aria-live="polite">
	{#each shown as item (item.id)}
		<div
			class="toast"
			class:failed={item.failed}
			class:plain={!item.action && !item.detail && !dismissible && !item.lasting}
			role="status"
			onpointerenter={onhold}
			onpointerleave={onrelease}
			{@attach swipeAway(() => dismiss(item))}
			in:presence
			out:leave
		>
			<span class="flex min-w-0 items-center gap-2.5">
				{#if item.busy}<Spinner size={15} />{/if}
				<span class="text-pretty">{item.message}</span>
			</span>
			{#if item.detail}
				{@const detail = item.detail}
				<button class="toast-action" type="button" onclick={() => (reading = detail)}>{t('ui-toast-details')}</button>
			{/if}
			{#if item.action}
				{@const action = item.action}
				<button class="toast-action" type="button" onclick={() => act(item, action.run)}>{action.label}</button>
			{/if}
			{#if dismissible || item.lasting}
				<button type="button" class="icon-button" aria-label={t('ui-toast-dismiss')} onclick={() => dismiss(item)}>
					<X size={15} />
				</button>
			{/if}
		</div>
	{/each}
</div>

{#if reading}
	{@const detail = reading}
	<Dialog title={detail.title} onclose={() => (reading = null)}>
		<p class="font-mono text-[12.5px] leading-relaxed text-[var(--text-soft)] select-text [overflow-wrap:anywhere]">{detail.text}</p>
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (reading = null)}>{t('ui-dialog-close')}</button>
		{/snippet}
	</Dialog>
{/if}

