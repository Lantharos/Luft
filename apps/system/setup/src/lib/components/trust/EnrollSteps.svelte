<script lang="ts">
	import { t } from '@luft/i18n';
	import MokScreen from './MokScreen.svelte';

	interface Props {
		code: string;
	}

	const SHIM = {
		title: 'Shim UEFI key management',
		press: 'Press any key to perform\nMOK management',
		countdown: 'Booting in 60 seconds',
		menu: 'Perform MOK management',
		enroll: 'Enroll MOK',
		keys: '[Enroll MOK]',
		next: 'Continue',
		question: 'Enroll the key(s)?',
		yes: 'Yes',
		password: 'Password:',
		reboot: 'Reboot'
	};

	let { code }: Props = $props();

	let steps = $derived([
		{ caption: t('setup-enroll-press-any-key'), screen: { heading: SHIM.title, items: [], prompt: SHIM.press, footer: SHIM.countdown } },
		{
			caption: t('setup-enroll-choose', { option: SHIM.enroll }),
			screen: { heading: SHIM.menu, items: ['Continue boot', SHIM.enroll, 'Enroll key from disk', 'Enroll hash from disk'], highlighted: 1 }
		},
		{ caption: t('setup-enroll-choose', { option: SHIM.next }), screen: { heading: SHIM.keys, items: ['View key 0', SHIM.next], highlighted: 1 } },
		{ caption: t('setup-enroll-confirm', { question: SHIM.question, option: SHIM.yes }), screen: { heading: SHIM.question, items: ['No', SHIM.yes], highlighted: 1 } },
		{
			caption: t('setup-enroll-type', { prompt: SHIM.password, option: SHIM.reboot }),
			screen: { heading: SHIM.question, items: [], prompt: SHIM.password }
		}
	]);

	let halves = $derived([code.slice(0, 4), code.slice(4)]);
</script>

<div class="flex flex-col gap-6">
	<ol class="grid grid-cols-5 gap-3">
		{#each steps as step, index (index)}
			<li class="flex flex-col gap-2">
				<MokScreen {...step.screen} />
				<span class="text-[12px] leading-snug text-[var(--text-soft)]"><span class="font-semibold text-[var(--text)]">{index + 1}.</span> {step.caption}</span>
			</li>
		{/each}
	</ol>
	{#if code}
		<div class="flex flex-col items-center gap-1.5">
			<span class="flex gap-[0.6em] font-mono text-[34px] font-semibold tracking-[0.12em] tabular-nums" aria-label={t('setup-enroll-code-label', { code })}>
				{#each halves as half, index (index)}<span>{half}</span>{/each}
			</span>
			<span class="text-[12.5px] text-[var(--text-soft)]">{t('setup-enroll-code-hint')}</span>
		</div>
	{/if}
</div>
