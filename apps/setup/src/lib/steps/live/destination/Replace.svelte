<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import type { LinuxSystem } from '#lib/api/installer.js';
	import { install } from '#lib/state/install.svelte.js';
	import { plural } from '@luft/ui';

	let { system }: { system: LinuxSystem } = $props();

	let kept = $derived(
		[
			system.owner && `Your files, and your account ${system.owner.name}${system.owner.password ? ' with its password' : ''}`,
			system.accounts > 1 && `The other ${plural(system.accounts - 1, 'account', 'accounts')} on it, with their files`,
			system.networks > 0 && `${plural(system.networks, 'network connection', 'network connections')}, with Wi-Fi passwords`,
			system.drives.length > 0 && `${system.drives.join(', ')}, mounted at startup as before`,
			system.hostname && `The computer’s name, ${system.hostname}, and its SSH keys`,
			system.packages > 0 && `${plural(system.packages, 'command-line tool', 'command-line tools')} you installed, in a Toolbox after you sign in`
		].filter((line): line is string => !!line)
	);

	let changed = $derived(
		[
			system.keepsOld
				? `${system.name} stops starting. Its system files are kept as old-system until you remove them in Disks or Settings.`
				: `${system.name}’s system partition is erased. Your files are on their own partition and stay as they are.`,
			system.startup === 'boot' && 'Its /boot partition is cleared to hold Luft’s startup files.',
			'Apps installed in it don’t come along. Get them again from Schelf.'
		].filter((line): line is string => !!line)
	);
</script>

<div class="flex flex-col gap-6">
	<section class="flex flex-col gap-2.5">
		<h2 class="text-[14px] font-semibold">What stays</h2>
		<ul class="flex flex-col gap-2">
			{#each kept as line (line)}
				<li class="flex gap-3 text-[14px] leading-snug"><Check size={17} class="mt-0.5 flex-none text-[var(--accent)]" />{line}</li>
			{/each}
		</ul>
	</section>
	<section class="flex flex-col gap-2.5">
		<h2 class="text-[14px] font-semibold">What changes</h2>
		<ul class="flex flex-col gap-2">
			{#each changed as line (line)}
				<li class="flex gap-3 text-[14px] leading-snug text-[var(--text-soft)]"><RefreshCw size={16} class="mt-0.5 flex-none text-[var(--text-muted)]" />{line}</li>
			{/each}
		</ul>
	</section>
	{#if install.startError}
		<p class="text-[13.5px] text-[var(--danger)]">{install.startError}</p>
	{/if}
</div>
