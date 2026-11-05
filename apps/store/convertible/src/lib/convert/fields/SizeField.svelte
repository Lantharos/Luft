<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented, TextField } from '@luft/ui';
	import type { Options } from '#lib/bindings.js';

	interface Props {
		options: Options;
	}

	let { options }: Props = $props();

	const units = $derived([
		{ value: 1 << 10, label: t('option-kilobytes') },
		{ value: 1 << 20, label: t('option-megabytes') }
	]);

	let unit = $state(1 << 20);

	const shown = () => (options.targetBytes ? String(options.targetBytes / unit) : '');

	function take(text: string) {
		const amount = Number(text.replace(',', '.'));
		options.targetBytes = amount > 0 ? Math.round(amount * unit) : null;
	}
</script>

<div class="flex items-center gap-2">
	<div class="min-w-0 flex-1">
		<TextField label={t('option-target-size')} placeholder={t('option-target-none')} inputmode="decimal" bind:value={shown, take} />
	</div>
	<Segmented label={t('option-target-unit')} options={units} value={unit} onchange={(value) => (unit = value)} />
</div>
