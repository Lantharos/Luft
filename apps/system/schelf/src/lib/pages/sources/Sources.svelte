<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Row, Section, Spinner, TextField } from '@luft/ui';
	import { commands, type AddedSource, type CheckedSource } from '#lib/bindings.js';
	import ProgressButton from '#lib/components/ProgressButton.svelte';
	import SourceTrustDialog from '#lib/components/SourceTrustDialog.svelte';
	import { SLOW } from '#lib/bridge/index.js';
	import { library } from '#lib/state/library.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';
	import { policy } from '#lib/state/policy.svelte.js';

	let sources = $state<AddedSource[] | null>(null);
	let address = $state('');
	let checking = $state(false);
	let error = $state<string | null>(null);
	let trusting = $state<CheckedSource | null>(null);
	let removing = $state<AddedSource | null>(null);
	let explaining = $state(false);

	const key = (source: AddedSource) => `repository/${source.file}`;

	async function refresh() {
		sources = await commands
			.sourcesList()
			.catch((reason) => {
				error = String(reason);
				return [];
			});
	}

	$effect(() => {
		void library.installed;
		void refresh();
	});

	async function check() {
		if (!address.trim() || checking) return;
		checking = true;
		error = null;
		try {
			const checked = await commands.sourcesFetch({ source: address.trim() }, SLOW);
			if (checked.added) error = t('sources-already-added', { name: checked.described.sources[0]?.name ?? checked.described.file });
			else trusting = checked;
		} catch (reason) {
			error = String(reason);
		} finally {
			checking = false;
		}
	}

	async function add(source: CheckedSource) {
		trusting = null;
		checking = true;
		try {
			await commands.sourcesAdd({ draft: source.draft }, SLOW);
			address = '';
			await refresh();
		} catch (reason) {
			error = String(reason);
		} finally {
			checking = false;
		}
	}

	function remove(source: AddedSource) {
		removing = null;
		void operations.run(key(source), source.name, { kind: 'removeRepository', file: source.file });
	}

	const removal = $derived.by(() => {
		if (!removing) return '';
		const packages = removing.packages;
		if (!packages.length) return t('sources-remove-nothing');
		return t('sources-remove-packages', { count: packages.length, packages: packages.join(', ') });
	});
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[760px] flex-col gap-7 px-8 pt-2 pb-10">
		<p class="px-2 text-[14px] text-[var(--text-soft)]">
			{t('sources-intro')}
		</p>

		<Section title={t('sources-add-title')} description={t('sources-add-description')}>
			<Row title={t('sources-source')} locked={!policy.addsSources}>
				<div class="flex items-center gap-2">
					<div class="w-[320px]">
						<TextField
							bind:value={address}
							label={t('sources-source')}
							placeholder="docker"
							disabled={checking}
							onkeydown={(event) => event.key === 'Enter' && check()}
						/>
					</div>
					<button type="button" class="button primary" disabled={!address.trim() || checking} onclick={check}>{#if checking}<Spinner />{t('sources-checking')}{:else}{t('sources-add')}{/if}</button>
				</div>
			</Row>
			<Row title={t('sources-other')} description={t('sources-other-description')}>
				<button type="button" class="button" onclick={() => (explaining = true)}>{t('sources-show')}</button>
			</Row>
		</Section>
		{#if error}
			<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{error}</p>
		{/if}

		{#if sources === null}
			<div class="skeleton h-20 w-full"></div>
		{:else if sources.length}
			<Section title={t('sources-added')}>
				{#each sources as source (source.file)}
					{@const operation = operations.forKey(key(source))}
					<Row
						title={source.name}
						description={operation?.state === 'failed' ? operation.error! : [source.url, source.packages.length ? t('sources-installed-from', { packages: source.packages.join(', ') }) : ''].filter(Boolean).join(' · ')}
						truncate
					>
						{#if operation && operation.state !== 'failed'}
							<ProgressButton {operation} />
						{:else}
							<button type="button" class="button" onclick={() => (removing = source)}>{t('sources-remove')}</button>
						{/if}
					</Row>
				{/each}
			</Section>
		{/if}
	</div>
</div>

{#if trusting}
	<SourceTrustDialog source={trusting} onconfirm={() => add(trusting!)} onclose={() => (trusting = null)} />
{/if}

{#if removing}
	<Dialog title={t('sources-remove-title', { name: removing.name })} description={removal} onclose={() => (removing = null)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = null)}>{t('sources-cancel')}</button>
			<button type="button" class="button danger" onclick={() => remove(removing!)}>{t('sources-remove')}</button>
		{/snippet}
	</Dialog>
{/if}

{#if explaining}
	<Dialog title={t('sources-other')} onclose={() => (explaining = false)}>
		<div class="flex flex-col">
			<Row title={t('sources-repo-file')} description={t('sources-repo-file-description')} />
			<Row title={t('sources-copr')} description={t('sources-copr-description')} />
		</div>
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (explaining = false)}>{t('sources-done')}</button>
		{/snippet}
	</Dialog>
{/if}
