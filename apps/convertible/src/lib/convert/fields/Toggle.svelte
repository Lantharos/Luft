<script lang="ts">
	import { Switch } from '@luft/ui';

	interface Props {
		label: string;
		description?: string;
		checked: boolean;
		onchange: (checked: boolean) => void;
	}

	let { label, description, checked, onchange }: Props = $props();
</script>

<div class="flex items-center justify-between gap-3 text-[13px]">
	<span class="min-w-0">
		<span class="block">{label}</span>
		{#if description}
			<span class="block text-[12px] leading-[1.4] text-[var(--text-muted)]">{description}</span>
		{/if}
	</span>
	<Switch {label} {checked} {onchange} />
</div>
