<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import type { EmptyStateProps } from './empty-states';

	let { icon, title, message, action, tone = 'neutral' }: EmptyStateProps = $props();
</script>

<div class={['empty-state', tone === 'danger' && 'is-danger']} role="status">
	<span class="empty-state__icon"><Icon name={icon} size={24} /></span>
	<p class="empty-state__title">{title}</p>
	{#if message}
		<p class="empty-state__message">{message}</p>
	{/if}
	{#if action}
		<button class="button mt-2" type="button" onclick={action.run}>{action.label}</button>
	{/if}
</div>
