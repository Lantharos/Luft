<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import type { ClassValue } from 'svelte/elements';
	import { t } from '@luft/i18n';
	import { toast as presence } from '../motion/transitions';
	import { swipeAway } from './swipe';
	import type { ToastMessage } from './toasts.svelte';

	interface Props {
		toast: ToastMessage | null;
		/** Shows a button that dismisses the toast. */
		dismissible?: boolean;
		class?: ClassValue;
		ondismiss: () => void;
		onhold?: () => void;
		onrelease?: () => void;
	}

	let { toast, dismissible = false, class: className, ondismiss, onhold, onrelease }: Props = $props();

	let shown = $derived(toast ? [toast] : []);

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
			class:plain={!item.action && !dismissible}
			role="status"
			onpointerenter={onhold}
			onpointerleave={onrelease}
			{@attach swipeAway(() => dismiss(item))}
			in:presence
			out:leave
		>
			<span class="min-w-0 truncate">{item.message}</span>
			{#if item.action}
				{@const action = item.action}
				<button class="toast-action" type="button" onclick={() => act(item, action.run)}>{action.label}</button>
			{/if}
			{#if dismissible}
				<button type="button" class="icon-button" aria-label={t('ui-toast-dismiss')} onclick={() => dismiss(item)}>
					<X size={15} />
				</button>
			{/if}
		</div>
	{/each}
</div>
