<script lang="ts">
	import Cog from '@lucide/svelte/icons/cog';
	import Send from '@lucide/svelte/icons/send';
	import X from '@lucide/svelte/icons/x';
	import { t } from '@luft/i18n';
	import { AppIcon, IconButton, ItemRow, Row, Section, Select } from '@luft/ui';
	import type { FirewallAccess, FirewallApp } from '@luft/network';
	import { app as settings } from '#lib/state/app.svelte.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';

	interface Props {
		apps: FirewallApp[];
		onchange: (app: FirewallApp, access: FirewallAccess) => void;
		onforget: (app: FirewallApp) => void;
	}

	let { apps, onchange, onforget }: Props = $props();

	const post = useSettings<{ visibility: string }>('com.lantharos.kestrel.post', ['visibility']);

	let choices = $derived<{ value: FirewallAccess; label: string }[]>([
		{ value: 'home', label: t('settings-network-firewall-access-home') },
		{ value: 'anywhere', label: t('settings-network-firewall-access-anywhere') },
		{ value: 'blocked', label: t('settings-network-firewall-access-blocked') }
	]);
</script>

<Section title={t('settings-network-firewall-apps')}>
	<Row
		title={t('settings-network-firewall-post')}
		icon={Send}
		description={t(post.values.visibility === 'no-one' ? 'settings-network-firewall-post-closed' : 'settings-network-firewall-post-open')}
		onclick={() => settings.open('post')}
	/>
	{#each apps as app (`${app.kind} ${app.id}`)}
		<ItemRow title={app.name} description={app.kind === 'program' && !app.icon ? t('settings-network-firewall-program') : undefined}>
			{#snippet leading()}
				{#if app.icon || app.kind === 'app'}
					<AppIcon icon={app.icon} id={app.id} size={28} />
				{:else}
					<span class="program"><Cog size={16} /></span>
				{/if}
			{/snippet}
			<Select
				label={t('settings-network-firewall-access-label', { app: app.name })}
				options={choices}
				value={app.access}
				onchange={(access) => onchange(app, access)}
			/>
			<IconButton icon={X} label={t('settings-network-firewall-forget', { app: app.name })} onclick={() => onforget(app)} />
		</ItemRow>
	{:else}
		<Row title={t('settings-network-firewall-apps-none')} />
	{/each}
</Section>

<style>
	.program {
		display: flex;
		width: 28px;
		height: 28px;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: var(--control);
		color: var(--text-soft);
	}
</style>
