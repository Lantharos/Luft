<script lang="ts">
	import { t } from '@luft/i18n';
	import Fingerprint from '@lucide/svelte/icons/fingerprint';
	import Trash from '@lucide/svelte/icons/trash';
	import { deleteFingerprint, Dialog, FINGERS, fingerInSentence, fingerLabel, fingerprints, IconButton, Row, Section, type Fingerprints } from '@luft/ui';
	import EnrollDialog from './EnrollDialog.svelte';

	let prints = $state<Fingerprints | null>(null);
	let enrolling = $state(false);
	let removing = $state<string | null>(null);
	let problem = $state('');

	let available = $derived(prints ? FINGERS.map(([finger]) => finger).filter((finger) => !prints!.enrolled.includes(finger)) : []);

	async function load() {
		prints = await fingerprints();
	}

	async function remove(finger: string) {
		removing = null;
		problem = '';
		try {
			await deleteFingerprint(finger);
		} catch (reason) {
			problem = reason instanceof Error ? reason.message : String(reason);
		}
		await load();
	}

	function finish() {
		enrolling = false;
		void load();
	}

	void load();
</script>

{#if prints}
	<Section title={t('settings-users-fingerprints')}>
		{#each prints.enrolled as finger (finger)}
			<Row title={fingerLabel(finger)} icon={Fingerprint}>
				<IconButton icon={Trash} label={t('settings-users-fingerprint-remove', { finger: fingerLabel(finger) })} onclick={() => (removing = finger)} />
			</Row>
		{/each}
		{#if available.length}
			<Row
				title={t('settings-users-fingerprint-add')}
				icon={prints.enrolled.length ? undefined : Fingerprint}
				description={prints.enrolled.length ? undefined : t('settings-users-fingerprint-add-description')}
				onclick={() => (enrolling = true)}
			/>
		{/if}
	</Section>

	{#if problem}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}

	{#if enrolling}
		<EnrollDialog fingers={available} swipe={prints.swipe} stages={prints.stages} onclose={finish} />
	{/if}
{/if}

{#if removing}
	{@const finger = removing}
	<Dialog title={t('settings-users-fingerprint-remove-title')} description={t('settings-users-fingerprint-remove-description', { finger: fingerInSentence(finger) })} onclose={() => (removing = null)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = null)}>{t('settings-users-cancel')}</button>
			<button type="button" class="button danger" onclick={() => remove(finger)}>{t('settings-users-remove')}</button>
		{/snippet}
	</Dialog>
{/if}
