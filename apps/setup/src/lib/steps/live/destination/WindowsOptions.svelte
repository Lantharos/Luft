<script lang="ts">
	import { t } from '@luft/i18n';
	import { Switch } from '@luft/ui';
	import type { WindowsChoices, WindowsVolume } from '#lib/bindings.js';
	import { install } from '#lib/state/install.svelte.js';

	interface Props {
		windows: WindowsVolume;
	}

	interface Option {
		key: keyof WindowsChoices;
		title: string;
		description: string;
	}

	let { windows }: Props = $props();

	let options = $derived(
		[
			windows.fastStartup && {
				key: 'fastStartupOff',
				title: t('setup-windows-fast-startup'),
				description: t('setup-windows-fast-startup-description')
			},
			!windows.universalClock && {
				key: 'universalClock',
				title: t('setup-windows-clock'),
				description: t('setup-windows-clock-description')
			},
			windows.bluetooth > 0 && {
				key: 'bluetooth',
				title: t('setup-windows-bluetooth'),
				description: t('setup-windows-bluetooth-description', { count: windows.bluetooth })
			}
		].filter((option): option is Option => !!option)
	);
</script>

{#if options.length > 0}
	<div class="flex flex-col gap-4">
		{#each options as option (option.key)}
			<div class="flex items-center gap-4">
				<div class="flex min-w-0 flex-1 flex-col gap-0.5">
					<span class="text-[14px] font-medium">{option.title}</span>
					<span class="text-[13px] leading-snug text-[var(--text-soft)]">{option.description}</span>
				</div>
				<Switch
					checked={install.windowsChoices[option.key]}
					label={option.title}
					onchange={(checked) => (install.windowsChoices[option.key] = checked)}
				/>
			</div>
		{/each}
	</div>
{/if}
