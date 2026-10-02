<script lang="ts">
	import Type from '@lucide/svelte/icons/type';
	import { loadFont } from './faces';

	let { path }: { path: string } = $props();

	let family = $state<string | null>(null);
	let failed = $state(false);

	$effect(() => {
		let current = true;
		family = null;
		failed = false;
		loadFont(path).then(
			(name) => current && (family = name),
			() => current && (failed = true)
		);
		return () => (current = false);
	});
</script>

{#if family}
	<span class="sample" style:font-family="'{family}'">Aa</span>
{:else if failed}
	<Type size={34} strokeWidth={1.5} />
{/if}

<style>
	.sample {
		font-size: 44px;
		line-height: 1;
		color: var(--text);
		animation: reveal 200ms var(--ease);
	}

	@keyframes reveal {
		from {
			opacity: 0;
		}
	}
</style>
