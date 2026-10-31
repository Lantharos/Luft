<script lang="ts">
	import { t } from '@luft/i18n';
	import Plus from '@lucide/svelte/icons/plus';
	import { AppIcon, ItemRow, Row, Section, Slider, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { App } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
	import ChooseAppDialog from '../../protection/apps/ChooseAppDialog.svelte';

	type SeeThrough = {
		'see-through-apps': string[];
		'see-through-opacity': number;
		'see-through-blur': boolean;
		'see-through-keep-text': boolean;
	};

	const look = useSettings<SeeThrough>(KESTREL_SCHEMA, ['see-through-apps', 'see-through-opacity', 'see-through-blur', 'see-through-keep-text']);

	let installed = $state<App[]>([]);
	let adding = $state(false);

	let ids = $derived(look.values['see-through-apps'] ?? []);
	let apps = $derived(ids.map((id) => installed.find((app) => app.id === id) ?? { id, name: id, icon: null }));

	void commands.appsInstalled().then((list) => (installed = list));

	function add(id: string) {
		adding = false;
		look.set('see-through-apps', [...ids, id]);
	}
</script>

<Section title={t('settings-see-through')} description={t('settings-see-through-description')}>
	{#each apps as app (app.id)}
		<ItemRow title={app.name}>
			{#snippet leading()}
				<AppIcon icon={app.icon} id={app.id} />
			{/snippet}
			<Switch
				label={t('settings-see-through-app', { app: app.name })}
				checked={true}
				onchange={() => look.set('see-through-apps', ids.filter((id) => id !== app.id))}
			/>
		</ItemRow>
	{/each}
	<Row title={t('settings-see-through-add')} icon={Plus} onclick={() => (adding = true)} />
</Section>

{#if apps.length}
	<Section>
		<Row title={t('settings-see-through-amount')}>
			<Slider
				label={t('settings-see-through-amount')}
				min={0.05}
				max={0.8}
				value={1 - (look.values['see-through-opacity'] ?? 0.7)}
				format={percent}
				onchange={(amount) => look.set('see-through-opacity', 1 - amount)}
			/>
		</Row>
		<Row title={t('settings-see-through-blur')}>
			<Switch label={t('settings-see-through-blur')} checked={look.values['see-through-blur'] ?? true} onchange={(on) => look.set('see-through-blur', on)} />
		</Row>
		<Row title={t('settings-see-through-text')} description={t('settings-see-through-text-description')}>
			<Switch label={t('settings-see-through-text')} checked={look.values['see-through-keep-text'] ?? true} onchange={(on) => look.set('see-through-keep-text', on)} />
		</Row>
	</Section>
{/if}

{#if adding}
	<ChooseAppDialog
		title={t('settings-see-through-add-title')}
		description={t('settings-see-through-add-description')}
		exclude={ids}
		onchoose={add}
		onclose={() => (adding = false)}
	/>
{/if}
