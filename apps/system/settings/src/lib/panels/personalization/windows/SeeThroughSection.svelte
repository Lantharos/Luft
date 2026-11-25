<script lang="ts">
	import { t } from '@luft/i18n';
	import Plus from '@luft/symbols/icons/plus';
	import { AppIcon, ItemRow, Row, Section, Segmented, Slider, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { App } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';
	import ChooseAppDialog from '#lib/panels/system/apps/ChooseAppDialog.svelte';
	import { GLASS_SCHEMA, type Glass, type GlassStyle } from '../appearance/glass.js';
	import GlassPreview from '../appearance/GlassPreview.svelte';
	import { currentWallpaper } from '../wallpaper/current.svelte';

	type SeeThrough = {
		'see-through-apps': string[];
		'see-through-opacity': number;
		'see-through-keep-text': boolean;
	};

	const look = useSettings<SeeThrough>(KESTREL_SCHEMA, ['see-through-apps', 'see-through-opacity', 'see-through-keep-text']);
	const glass = useSettings<Pick<Glass, 'see-through'>>(GLASS_SCHEMA, ['see-through']);
	const wallpaper = currentWallpaper();

	let installed = $state<App[]>([]);
	let adding = $state(false);

	let ids = $derived(look.values['see-through-apps'] ?? []);
	let amount = $derived(1 - (look.values['see-through-opacity'] ?? 0.7));
	let materials = $derived<{ value: GlassStyle; label: string }[]>([
		{ value: 'luca', label: t('settings-appearance-glass-luca') },
		{ value: 'maris', label: t('settings-appearance-glass-maris') },
		{ value: 'niko', label: t('settings-appearance-glass-niko') }
	]);
	let apps = $derived(ids.map((id) => installed.find((app) => app.id === id) ?? { id, name: id, icon: null }));

	void commands.appsInstalled().then((list) => (installed = list));

	const opacityFor = (seeThrough: number) => Math.round((1 - seeThrough) * 100) / 100;

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
		<Row title={t('settings-see-through-material')}>
			<Segmented label={t('settings-see-through-material')} options={materials} value={glass.values['see-through'] ?? 'niko'} onchange={(material) => glass.set('see-through', material)}>
				{#snippet item(option)}
					<span class="flex items-center gap-2 pe-1 text-[13px] font-medium">
						<GlassPreview style={option.value} wallpaper={wallpaper.url} />
						{option.label}
					</span>
				{/snippet}
			</Segmented>
		</Row>
		<Row title={t('settings-see-through-amount')}>
			<span class="w-11 text-right tabular-nums">{percent(amount)}</span>
			{#snippet below()}
				<Slider
					label={t('settings-see-through-amount')}
					min={0.05}
					max={0.8}
					value={amount}
					format={percent}
					onchange={(next) => look.set('see-through-opacity', opacityFor(next))}
				/>
			{/snippet}
		</Row>
		<Row title={t('settings-see-through-text')} description={t('settings-see-through-text-description')}>
			<Switch label={t('settings-see-through-text')} checked={look.values['see-through-keep-text'] ?? true} onchange={(on) => look.set('see-through-keep-text', on)} />
		</Row>
	</Section>
{/if}

{#if adding}
	<ChooseAppDialog
		title={t('settings-see-through-add-title')}
		exclude={ids}
		onchoose={add}
		onclose={() => (adding = false)}
	/>
{/if}
