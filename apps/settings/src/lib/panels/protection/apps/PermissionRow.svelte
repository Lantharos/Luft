<script lang="ts">
	import type { Component } from 'svelte';
	import { t } from '@luft/i18n';
	import { Row, Switch } from '@luft/ui';
	import type { AppPermission } from './permissions.svelte';

	interface Props {
		title: string;
		icon: Component;
		apps: AppPermission[];
		disabled: boolean;
		ontoggle: (app: AppPermission, allowed: boolean) => void;
	}

	let { title, icon, apps, disabled, ontoggle }: Props = $props();

	let expanded = $state(false);

	let allowed = $derived(apps.filter((app) => app.allowed).length);
</script>

<Row {title} {icon} description={t('settings-privacy-apps-allowed', { allowed, total: apps.length })} {disabled} {expanded} onclick={() => (expanded = !expanded)} />
{#if expanded}
	{#each apps as app (app.id)}
		<Row title={app.name} {disabled}>
			<Switch label={app.name} checked={app.allowed} {disabled} onchange={(on) => ontoggle(app, on)} />
		</Row>
	{/each}
{/if}
