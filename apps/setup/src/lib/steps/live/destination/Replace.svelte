<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { i18n, t } from '@luft/i18n';
	import type { LinuxSystem } from '#lib/bridge/installer.js';
	import { install } from '#lib/state/install.svelte.js';

	let { system }: { system: LinuxSystem } = $props();

	let kept = $derived(
		[
			system.owner &&
				t(system.owner.password ? 'setup-replace-keeps-account-password' : 'setup-replace-keeps-account', { account: system.owner.name }),
			system.accounts > 1 && t('setup-replace-keeps-accounts', { count: system.accounts - 1 }),
			system.networks > 0 && t('setup-replace-keeps-networks', { count: system.networks }),
			system.drives.length > 0 && t('setup-replace-keeps-drives', { drives: new Intl.ListFormat(i18n.locale).format(system.drives) }),
			system.hostname && t('setup-replace-keeps-hostname', { hostname: system.hostname }),
			system.packages > 0 && t('setup-replace-keeps-tools', { count: system.packages })
		].filter((line): line is string => !!line)
	);

	let changed = $derived(
		[
			t(system.keepsOld ? 'setup-replace-keeps-old' : 'setup-replace-erases-system', { system: system.name }),
			system.startup === 'boot' && t('setup-replace-clears-boot'),
			t('setup-replace-apps')
		].filter((line): line is string => !!line)
	);
</script>

<div class="flex flex-col gap-6">
	<section class="flex flex-col gap-2.5">
		<h2 class="text-[14px] font-semibold">{t('setup-replace-stays')}</h2>
		<ul class="flex flex-col gap-2">
			{#each kept as line (line)}
				<li class="flex gap-3 text-[14px] leading-snug"><Check size={17} class="mt-0.5 flex-none text-[var(--accent)]" />{line}</li>
			{/each}
		</ul>
	</section>
	<section class="flex flex-col gap-2.5">
		<h2 class="text-[14px] font-semibold">{t('setup-replace-changes')}</h2>
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
