<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import { Dialog, tooltip } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Drive, Health } from '#lib/bindings.js';
	import { WAIT } from '#lib/bridge/index.js';
	import { duration, healthAdvice, percent, selftestResult, temperature } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import Facts from './Facts.svelte';

	interface Props {
		drive: Drive;
		health: Health;
		onclose: () => void;
	}

	let { drive, health, onclose }: Props = $props();

	let key = $derived(`${drive.id}:test`);
	let busy = $derived(disks.busy.has(key));
	let testing = $derived(health.selftest.status === 'inprogress');
	let done = $derived(testing && health.selftest.remaining !== null ? 100 - health.selftest.remaining : null);
	let facts = $derived(
		[
			health.temperature !== null && { label: t('disks-health-temperature'), value: temperature(health.temperature) },
			health.powerOnHours !== null && { label: t('disks-health-powered-on'), value: duration(health.powerOnHours) },
			health.badSectors > 0 && { label: t('disks-health-bad-sectors'), value: health.badSectors.toLocaleString(i18n.formats) },
			{ label: t('disks-health-selftest'), value: testing ? (done !== null ? t('disks-health-selftest-running-progress', { progress: percent(done / 100) }) : t('disks-health-selftest-running')) : (selftestResult(health.selftest.status) ?? t('disks-health-selftest-never')) }
		].filter((fact) => fact !== false)
	);

	function test(extended: boolean) {
		void disks.run(key, () => commands.disksSelftest({ drive: drive.id, extended }, WAIT));
	}
</script>

<Dialog title={t('disks-health-dialog-title', { state: health.state })} description={healthAdvice(health)} {onclose}>
	<Facts {facts} />
	{#if testing && done !== null}
		<div class="mx-1 h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
			<div class="h-full origin-left rounded-full bg-[var(--accent)] transition-transform" style:transform="scaleX({done / 100})"></div>
		</div>
	{/if}
	{#snippet actions()}
		{#if testing}
			<button type="button" class="button mr-auto" disabled={busy} onclick={() => disks.run(key, () => commands.disksSelftestStop({ drive: drive.id }, WAIT))}>{t('disks-health-stop-test')}</button>
		{:else}
			<button type="button" class="button" disabled={busy} onclick={() => test(false)} {@attach tooltip(t('disks-health-quick-test.tooltip'))}>{t('disks-health-quick-test')}</button>
			<button type="button" class="button mr-auto" disabled={busy} onclick={() => test(true)} {@attach tooltip(t('disks-health-full-test.tooltip'))}>{t('disks-health-full-test')}</button>
		{/if}
		<button type="button" class="button primary" onclick={onclose}>{t('disks-done')}</button>
	{/snippet}
</Dialog>
