<script lang="ts">
	import MokScreen from './MokScreen.svelte';

	interface Props {
		code: string;
	}

	const STEPS = [
		{ caption: 'Press any key within ten seconds', screen: { heading: 'Shim', items: [], prompt: 'Press any key to perform\nMOK management' } },
		{ caption: 'Choose Enroll MOK, then Continue', screen: { heading: 'Perform MOK management', items: ['Continue boot', 'Enroll MOK', 'Enroll key from disk', 'Enroll hash from disk'], highlighted: 1 } },
		{ caption: 'Choose Yes', screen: { heading: 'Enroll the key(s)?', items: ['No', 'Yes'], highlighted: 1 } },
		{ caption: 'Type your code, then choose Reboot', screen: { heading: 'Enroll MOK', items: [], prompt: 'Password:\n• • • • • • • •' } }
	];

	let { code }: Props = $props();
</script>

<div class="flex flex-col gap-7">
	<ol class="grid grid-cols-4 gap-4">
		{#each STEPS as step, index (step.caption)}
			<li class="flex flex-col gap-2.5">
				<MokScreen {...step.screen} />
				<span class="text-[12.5px] leading-snug text-[var(--text-soft)]"><span class="font-semibold text-[var(--text)]">{index + 1}.</span> {step.caption}</span>
			</li>
		{/each}
	</ol>
	{#if code}
		<div class="flex items-center gap-5">
			<span class="font-mono text-[34px] font-semibold tracking-[0.12em] tabular-nums">{code.slice(0, 4)} {code.slice(4)}</span>
			<span class="max-w-[300px] text-[13.5px] leading-snug text-[var(--text-soft)]">Your code, for when the blue screen asks for a password.</span>
		</div>
	{/if}
</div>
