<script lang="ts">
	import { TextField } from '@luft/ui';

	interface Props {
		name: string;
		matches: boolean;
	}

	let { name, matches = $bindable() }: Props = $props();

	let typed = $state('');

	$effect.pre(() => {
		matches = typed.trim().toLowerCase() === name.trim().toLowerCase();
	});
</script>

<div class="flex flex-col gap-2">
	<p class="text-[13px] leading-relaxed text-[var(--text-soft)]">This drive is built into the computer. To erase it, type its name: {name}</p>
	<TextField label="Name of the drive" placeholder={name} bind:value={typed} />
</div>
