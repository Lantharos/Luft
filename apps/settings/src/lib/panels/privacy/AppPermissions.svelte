<script lang="ts">
	import Row from '$lib/components/controls/Row.svelte';
	import Switch from '$lib/components/controls/Switch.svelte';
	import { onPermissionsChanged, permissions, setPermission, type AppPermission, type PermissionKind } from './api';

	interface Props {
		kind: PermissionKind;
		disabled: boolean;
		empty: string;
	}

	let { kind, disabled, empty }: Props = $props();

	let apps = $state<AppPermission[]>([]);

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

{#each apps as app (app.id)}
	<Row title={app.name} {disabled}>
		<Switch label={app.name} checked={app.allowed} {disabled} onchange={(allowed) => toggle(app, allowed)} />
	</Row>
{:else}
	<p class="px-4 py-3.5 text-[13px] text-[var(--text-muted)]">{empty}</p>
{/each}
