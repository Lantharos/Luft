<script lang="ts">
	import { AppIcon, errorText, Select } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { OpenWithApps } from '#lib/bindings.js';

	interface Props {
		path: string;
	}

	let { path }: Props = $props();
	let apps = $state.raw<OpenWithApps | null>(null);
	let error = $state<string | null>(null);

	let choices = $derived(
		apps ? [...(apps.default ? [apps.default] : []), ...apps.others].map((app) => ({ value: app.id, label: app.name })) : []
	);

	$effect(() => {
		void load(path);
	});

	async function load(target: string) {
		apps = await commands.appsForFile({ path: target }).catch(() => null);
	}

	async function choose(id: string) {
		error = null;
		try {
			await commands.setDefaultApp({ path, app: id });
			await load(path);
		} catch (caught) {
			error = errorText(caught);
		}
	}
</script>

{#if apps && choices.length > 0}
	<div class="flex items-center gap-3">
		<AppIcon icon={apps.default?.icon ?? null} id={apps.default?.id} size={28} />
		<Select
			label="Opens with"
			placeholder="Choose an app"
			value={apps.default?.id ?? ''}
			options={choices}
			onchange={choose}
		/>
	</div>
	{#if error}
		<p class="text-[12px] text-[var(--danger)]">{error}</p>
	{/if}
{:else if apps}
	<span class="text-[var(--text-muted)]">No installed app opens this kind of file</span>
{/if}
