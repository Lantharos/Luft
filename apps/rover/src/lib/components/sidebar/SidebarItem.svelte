<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		icon: IconName;
		label: string;
		active?: boolean;
		dropping?: boolean;
		spinning?: boolean;
		detail?: Snippet;
		trailing?: Snippet;
	}

	let { icon, label, active = false, dropping = false, spinning = false, detail, trailing, class: className, ...rest }: Props =
		$props();
</script>

<div class={['sidebar-item', active && 'is-active', dropping && 'is-drop-target', className]}>
	<button class="sidebar-item__main" type="button" aria-current={active ? 'page' : undefined} {...rest}>
		<Icon name={icon} size={18} class={spinning ? 'animate-spin' : ''} />
		<span class="sidebar-item__text">
			<span class="truncate">{label}</span>
			{@render detail?.()}
		</span>
	</button>
	{@render trailing?.()}
</div>
