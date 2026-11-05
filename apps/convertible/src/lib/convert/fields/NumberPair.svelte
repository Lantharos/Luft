<script lang="ts">
	import { t } from '@luft/i18n';
	import { TextField } from '@luft/ui';
	import type { Options } from '#lib/bindings.js';

	interface Props {
		options: Options;
	}

	let { options }: Props = $props();

	const shown = (value: number | null) => (value ? String(value) : '');
	const parsed = (text: string) => {
		const value = Math.round(Number(text));
		return value > 0 ? value : null;
	};
</script>

<div class="flex items-center gap-2">
	<TextField label={t('option-width')} placeholder={t('option-width')} inputmode="numeric" bind:value={() => shown(options.width), (text) => (options.width = parsed(text))} />
	<span class="text-[var(--text-muted)]">×</span>
	<TextField label={t('option-height')} placeholder={t('option-height')} inputmode="numeric" bind:value={() => shown(options.height), (text) => (options.height = parsed(text))} />
</div>
