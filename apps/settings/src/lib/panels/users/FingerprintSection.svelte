<script lang="ts">
	import Fingerprint from '@lucide/svelte/icons/fingerprint';
	import Trash from '@lucide/svelte/icons/trash';
	import { Dialog, IconButton, Row, Section } from '@luft/ui';
	import EnrollDialog from './EnrollDialog.svelte';
	import { deleteFingerprint, fingerprints, type Fingerprints } from './api';
	import { FINGERS, fingerLabel } from './fingers';

	let prints = $state<Fingerprints | null>(null);
	let enrolling = $state(false);
	let removing = $state<string | null>(null);
	let problem = $state('');

	let available = $derived(prints ? FINGERS.filter(([finger]) => !prints!.enrolled.includes(finger)) : []);

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
	<Section title="Fingerprints">
		{#each prints.enrolled as finger (finger)}
			<Row title={fingerLabel(finger)} icon={Fingerprint}>
				<IconButton icon={Trash} label="Remove {fingerLabel(finger)}" onclick={() => (removing = finger)} />
			</Row>
		{/each}
		{#if available.length}
			<Row
				title="Add a fingerprint"
				icon={prints.enrolled.length ? undefined : Fingerprint}
				description={prints.enrolled.length ? undefined : 'Sign in and unlock with your finger instead of typing your password'}
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
	<Dialog title="Remove this fingerprint?" description="You won’t be able to use your {fingerLabel(finger).toLowerCase()} to sign in anymore." onclose={() => (removing = null)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = null)}>Cancel</button>
			<button type="button" class="button danger" onclick={() => remove(finger)}>Remove</button>
		{/snippet}
	</Dialog>
{/if}
