<script lang="ts">
	import { TitleBar } from '@luft/ui';
	import type { Snippet } from 'svelte';
	import Preferences from './Preferences.svelte';

	interface Props {
		title: string;
		detail?: string | null;
		children?: Snippet;
	}

	let { title, detail, children }: Props = $props();
</script>

<TitleBar {title} {detail}>
	{#snippet actions()}
		{@render children?.()}
		<Preferences />
	{/snippet}
</TitleBar>
