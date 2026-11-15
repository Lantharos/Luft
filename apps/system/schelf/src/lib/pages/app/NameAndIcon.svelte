<script lang="ts">
	import { t } from '@luft/i18n';
	import { errorText, Row, Section } from '@luft/ui';
	import { commands, type CustomIcons, type Names } from '#lib/bindings.js';
	import { library } from '#lib/state/library.svelte.js';
	import RenameDialog from './RenameDialog.svelte';

	let { desktop }: { desktop: string } = $props();

	let custom = $state<CustomIcons | null>(null);
	let names = $state<Names | null>(null);
	let renaming = $state(false);
	let busy = $state(false);
	let problem = $state('');

	async function load() {
		[custom, names] = await Promise.all([
			commands.libraryCustomIcons({ desktop }).catch(() => null),
			commands.libraryNames({ desktop }).catch(() => null)
		]);
	}

	$effect(() => {
		void load();
	});

	const refresh = () => Promise.all([load(), library.refresh()]);

	async function change(action: () => Promise<unknown>) {
		busy = true;
		problem = '';
		try {
			await action();
			await refresh();
		} catch (reason) {
			problem = errorText(reason);
		} finally {
			busy = false;
		}
	}

	function renamed(changed: boolean) {
		renaming = false;
		if (changed) void refresh();
	}
</script>

<Section title={t('app-name-and-icon')}>
	{#if names}
		<Row title={t('app-name')} description={names.custom ? t('app-name-custom', { name: names.own }) : t('app-name-own')}>
			<span class="max-w-[220px] truncate text-[var(--text-muted)]">{names.custom ?? names.own}</span>
			<button type="button" class="button" disabled={busy} onclick={() => (renaming = true)}>{t('app-rename')}</button>
		</Row>
	{/if}
	<Row title={t('app-icon')} description={custom?.icon ? t('app-icon-custom') : t('app-icon-own')}>
		<button type="button" class="button" disabled={busy} onclick={() => change(() => commands.libraryChooseIcon({ desktop }))}>{t('app-icon-change')}</button>
	</Row>
	<Row title={t('app-symbolic-icon')} description={custom?.symbolic ? t('app-symbolic-custom') : t('app-symbolic-drawn')}>
		<button type="button" class="button" disabled={busy} onclick={() => change(() => commands.libraryChooseSymbolicIcon({ desktop }))}>{t('app-icon-change')}</button>
	</Row>
	{#if custom?.icon || custom?.symbolic}
		<Row title={t('app-icon-reset-title')} description={t('app-icon-reset-description')}>
			<button type="button" class="button" disabled={busy} onclick={() => change(() => commands.libraryResetIcons({ desktop }))}>{t('app-icon-reset')}</button>
		</Row>
	{/if}
</Section>

{#if problem}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
{/if}

{#if renaming && names}
	<RenameDialog {desktop} {names} onclose={renamed} />
{/if}
