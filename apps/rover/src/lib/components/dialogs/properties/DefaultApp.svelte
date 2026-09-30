<script lang="ts">
	import { AppIcon, Select } from '@luft/ui';
	import * as api from '$lib/api';
	import * as features from '$lib/features/api';
	import type { OpenWithApps } from '$lib/types/details';
	import { errorMessage } from '$lib/utils/format';

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
		apps = await api.appsForFile(target).catch(() => null);
	}

	async function choose(id: string) {
		error = null;
		try {
			await features.setDefaultApp(path, id);
			await load(path);
		} catch (caught) {
			error = errorMessage(caught);
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
