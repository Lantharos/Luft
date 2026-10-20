<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Switch } from '@luft/ui';
	import { percent } from '#lib/format.js';
	import { setChargeLimit, type ChargeLimit } from './api';

	let { limit }: { limit: ChargeLimit } = $props();

	let pending = $state<boolean | null>(null);
	let failed = $state(false);

	let enabled = $derived(pending ?? limit.enabled);
	let description = $derived.by(() => {
		if (failed) return t('settings-power-limit-failed');
		if (limit.elsewhere) {
			if (limit.applied === null) return t('settings-power-limit-elsewhere-off');
			const level = { level: percent(limit.applied / 100) };
			return enabled ? t('settings-power-limit-elsewhere-changed', level) : t('settings-power-limit-elsewhere-on', level);
		}
		if (limit.stopsAt === null) return enabled ? t('settings-power-limit-automatic') : t('settings-power-limit-description');
		const level = { level: percent(limit.stopsAt / 100) };
		return enabled ? t('settings-power-limit-stops-at', level) : t('settings-power-limit-description-at', level);
	});

	$effect(() => {
		if (pending === limit.enabled) pending = null;
	});

	async function toggle(on: boolean) {
		pending = on;
		failed = false;
		try {
			await setChargeLimit(on);
		} catch {
			pending = null;
			failed = true;
		}
	}
</script>

{#if limit.adjustable}
	<Row title={t('settings-power-limit')} {description}>
		<Switch label={t('settings-power-limit')} checked={enabled} onchange={toggle} />
	</Row>
{:else if limit.applied !== null}
	<Row title={t('settings-power-limit-applied', { level: percent(limit.applied / 100) })} description={t('settings-power-limit-applied-description')} />
{/if}
