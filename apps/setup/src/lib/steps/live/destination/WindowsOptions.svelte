<script lang="ts">
	import { plural, Switch } from '@luft/ui';
	import type { WindowsChoices, WindowsVolume } from '#lib/api/installer.js';
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
				title: 'Turn off Fast Startup in Windows',
				description: 'Windows then shuts down fully, so sound, Wi-Fi and Bluetooth start fresh in Luft and its drive stays open.'
			},
			!windows.universalClock && {
				key: 'universalClock',
				title: 'Keep the clock right in both',
				description: 'Windows reads the computer’s clock the way Luft does, so the time no longer jumps when you switch.'
			},
			windows.bluetooth > 0 && {
				key: 'bluetooth',
				title: 'Bring your Bluetooth devices',
				description: `${plural(windows.bluetooth, 'device')} paired in Windows will work in Luft without pairing again.`
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
