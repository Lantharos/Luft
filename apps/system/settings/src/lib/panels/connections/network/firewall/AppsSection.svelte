<script lang="ts">
	import Terminal from '@lucide/svelte/icons/terminal';
	import { t } from '@luft/i18n';
	import { AppIcon, ItemRow, Row, Section, Select } from '@luft/ui';
	import type { FirewallAccess, FirewallApp } from '@luft/network';

	interface Props {
		apps: FirewallApp[];
		onchange: (app: FirewallApp, access: FirewallAccess) => void;
	}

	let { apps, onchange }: Props = $props();

	let choices = $derived<{ value: FirewallAccess; label: string }[]>([
		{ value: 'home', label: t('settings-network-firewall-access-home') },
		{ value: 'anywhere', label: t('settings-network-firewall-access-anywhere') },
		{ value: 'blocked', label: t('settings-network-firewall-access-blocked') }
	]);
</script>

<Section title={t('settings-network-firewall-apps')} description={t('settings-network-firewall-apps.description')}>
	{#each apps as app (`${app.kind} ${app.id}`)}
		<ItemRow title={app.name} description={app.kind === 'program' ? t('settings-network-firewall-program') : undefined}>
			{#snippet leading()}
				{#if app.kind === 'app'}
					<AppIcon icon={app.icon} id={app.id} size={28} />
				{:else}
					<span class="flex size-7 items-center justify-center text-[var(--text-soft)]"><Terminal size={20} /></span>
				{/if}
			{/snippet}
			<Select
				label={t('settings-network-firewall-access-label', { app: app.name })}
				options={choices}
				value={app.access}
				onchange={(access) => onchange(app, access)}
			/>
		</ItemRow>
	{:else}
		<Row title={t('settings-network-firewall-apps-none')} />
	{/each}
</Section>
