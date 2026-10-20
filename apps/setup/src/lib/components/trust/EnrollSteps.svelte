<script lang="ts">
	import { t } from '@luft/i18n';
	import MokScreen from './MokScreen.svelte';

	interface Props {
		code: string;
	}

	const STEPS = [
		{ caption: 'setup-enroll-press-key', screen: { heading: 'Shim', items: [], prompt: 'Press any key to perform\nMOK management' } },
		{ caption: 'setup-enroll-choose-enroll', screen: { heading: 'Perform MOK management', items: ['Continue boot', 'Enroll MOK', 'Enroll key from disk', 'Enroll hash from disk'], highlighted: 1 } },
		{ caption: 'setup-enroll-choose-yes', screen: { heading: 'Enroll the key(s)?', items: ['No', 'Yes'], highlighted: 1 } },
		{ caption: 'setup-enroll-type-code', screen: { heading: 'Enroll MOK', items: [], prompt: 'Password:\n• • • • • • • •' } }
	];

	let { code }: Props = $props();
</script>

<div class="flex flex-col gap-7">
	<ol class="grid grid-cols-4 gap-4">
		{#each STEPS as step, index (step.caption)}
			<li class="flex flex-col gap-2.5">
				<MokScreen {...step.screen} />
				<span class="text-[12.5px] leading-snug text-[var(--text-soft)]"><span class="font-semibold text-[var(--text)]">{index + 1}.</span> {t(step.caption)}</span>
			</li>
		{/each}
	</ol>
	{#if code}
		<div class="flex flex-col items-center gap-1">
			<span class="pl-[0.12em] font-mono text-[34px] font-semibold tracking-[0.12em] tabular-nums">{code}</span>
			<span class="text-[12.5px] text-[var(--text-soft)]">{t('setup-enroll-digits', { count: code.length })}</span>
		</div>
	{/if}
</div>
