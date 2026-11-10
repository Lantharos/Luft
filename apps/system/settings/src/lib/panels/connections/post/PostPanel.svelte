<script lang="ts">
	import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
	import Plus from '@lucide/svelte/icons/plus';
	import { t } from '@luft/i18n';
	import { basename, errorText, IconButton, Row, Section, Segmented, Switch } from '@luft/ui';
	import X from '@lucide/svelte/icons/x';
	import type { Firewall } from '@luft/network';
	import { commands } from '#lib/bindings.js';
	import type { PostState } from '#lib/bindings.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import NameDialog from './NameDialog.svelte';
	import PairDialog from './PairDialog.svelte';
	import { POST_KEYS, POST_SCHEMA, type PostSettings, type Visibility } from './settings';

	const post = useSettings<PostSettings>(POST_SCHEMA, [...POST_KEYS]);

	let info = $state<PostState | null>(null);
	let firewall = $state<Firewall | null>(null);
	let naming = $state(false);
	let pairing = $state(false);
	let problem = $state('');

	let visibility = $derived<Visibility>(post.values.visibility ?? 'your-devices');
	let devices = $derived(post.values.devices ?? []);
	let current = $derived(firewall?.networks.find((network) => network.connected) ?? null);
	let publicHere = $derived(visibility !== 'no-one' && current !== null && current.networkType !== 'home');

	let choices = $derived<{ value: Visibility; label: string }[]>([
		{ value: 'no-one', label: t('settings-post-visibility-no-one') },
		{ value: 'your-devices', label: t('settings-post-visibility-your-devices') },
		{ value: 'everyone', label: t('settings-post-visibility-everyone') }
	]);

	async function load() {
		info = await commands.postState().catch(() => null);
		firewall = await commands.networkFirewall().catch(() => null);
	}

	$effect(() => {
		void post.values.name;
		void post.values.folder;
		void load();
	});

	async function attempt(action: () => Promise<unknown>) {
		problem = '';
		try {
			await action();
		} catch (reason) {
			problem = errorText(reason);
		}
	}

	async function chooseFolder() {
		const folder = await commands.postChooseFolder();
		if (folder) await post.set('folder', folder);
	}

	function makeHome() {
		if (!current) return;
		const connection = current.connection;
		void attempt(async () => {
			await commands.networkSetType({ connection, networkType: 'home' });
			await load();
		});
	}

	const forget = (id: string) => post.set('devices', devices.filter(([known]) => known !== id));
</script>

<svelte:window onfocus={load} />

{#if problem}
	<p class="-my-3 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
{/if}

<Section>
	<Row title={t('settings-post-visibility')}>
		<Segmented label={t('settings-post-visibility')} options={choices} value={visibility} onchange={(chosen) => post.set('visibility', chosen)} />
	</Row>
	{#if publicHere && current}
		<Row title={t('settings-post-public', { network: current.name })} description={t('settings-post-public.description')}>
			<button type="button" class="button" onclick={makeHome}>{t('settings-post-make-home')}</button>
		</Row>
	{/if}
	<Row title={t('settings-post-name')} description={info?.alias}>
		<button type="button" class="button" onclick={() => (naming = true)}>{t('settings-post-rename')}</button>
	</Row>
	<Row title={t('settings-post-folder')} description={post.values.folder ? (info ? basename(info.folder) : undefined) : t('settings-post-folder-default')}>
		{#if post.values.folder}
			<button type="button" class="button" onclick={() => post.set('folder', '')}>{t('settings-post-folder-downloads')}</button>
		{/if}
		<button type="button" class="button" onclick={() => attempt(chooseFolder)}>{t('settings-post-folder-change')}</button>
	</Row>
</Section>

<Section title={t('settings-post-devices')}>
	{#each devices as [id, alias] (id)}
		<Row title={alias} icon={MonitorSmartphone}>
			<IconButton icon={X} label={t('settings-post-remove', { device: alias })} onclick={() => forget(id)} />
		</Row>
	{:else}
		<Row title={t('settings-post-devices-none')} />
	{/each}
	<Row title={t('settings-post-add')} icon={Plus} onclick={visibility === 'no-one' ? undefined : () => (pairing = true)} disabled={visibility === 'no-one'} />
</Section>

<Section>
	<Row title={t('settings-post-copy-text')}>
		<Switch label={t('settings-post-copy-text')} checked={post.values['copy-text'] ?? true} onchange={(on) => post.set('copy-text', on)} />
	</Row>
	<Row title={t('settings-post-copy-picture')}>
		<Switch label={t('settings-post-copy-picture')} checked={post.values['copy-picture'] ?? false} onchange={(on) => post.set('copy-picture', on)} />
	</Row>
</Section>

<p class="px-2 text-[13px] text-[var(--text-soft)]">
	{t('settings-post-localsend')}
	<button type="button" class="link" onclick={() => attempt(() => commands.postGetLocalsend())}>{t('settings-post-localsend-link')}</button>
</p>

{#if naming}
	<NameDialog name={post.values.name ?? ''} computer={info?.alias ?? ''} onsave={(name) => post.set('name', name)} onclose={() => (naming = false)} />
{/if}

{#if pairing}
	<PairDialog name={info?.alias ?? ''} {devices} onclose={() => (pairing = false)} />
{/if}

<style>
	.link {
		color: var(--accent);
		font-weight: 500;
	}
	.link:hover {
		text-decoration: underline;
	}
</style>
