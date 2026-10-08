<script lang="ts">
	import { Row, Switch } from '@luft/ui';
	import { onPermissionsChanged, permissions, setPermission, type AppPermission, type PermissionKind } from './api';

	interface Props {
		kind: PermissionKind;
		disabled: boolean;
	}

	let { kind, disabled }: Props = $props();

	let apps = $state<AppPermission[]>([]);
	let expanded = $state(false);

	let allowed = $derived(apps.filter((app) => app.allowed).length);

	$effect(() => {
		void permissions(kind).then((list) => (apps = list));
		return onPermissionsChanged((update) => {
			if (update.kind === kind) apps = update.apps;
		});
	});

	async function toggle(app: AppPermission, allowed: boolean) {
		app.allowed = allowed;
		try {
			await setPermission(kind, app.id, allowed);
		} catch {
			app.allowed = !allowed;
		}
	}
</script>

{#if apps.length}
	<Row title="Apps that asked" description="{allowed} of {apps.length} allowed" {disabled} {expanded} onclick={() => (expanded = !expanded)} />
	{#if expanded}
		{#each apps as app (app.id)}
			<Row title={app.name} {disabled}>
				<Switch label={app.name} checked={app.allowed} {disabled} onchange={(allowed) => toggle(app, allowed)} />
			</Row>
		{/each}
	{/if}
{/if}
