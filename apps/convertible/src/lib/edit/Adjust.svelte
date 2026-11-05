<script lang="ts">
	import { t } from '@luft/i18n';
	import { Slider } from '@luft/ui';
	import type { Edits } from '#lib/bindings.js';
	import { editor } from '#lib/state/editor.svelte.js';

	const AMOUNTS: { key: 'brightness' | 'contrast' | 'saturation'; id: string }[] = [
		{ key: 'brightness', id: 'adjust-brightness' },
		{ key: 'contrast', id: 'adjust-contrast' },
		{ key: 'saturation', id: 'adjust-saturation' }
	];

	const percent = (value: number) => `${value > 0 ? '+' : ''}${Math.round(value * 100)}%`;
	let baseline = '';

	function adjust(key: keyof Edits, value: number) {
		baseline ||= JSON.stringify(editor.edits);
		Object.assign(editor.edits, { [key]: value });
	}

	function finish(key: keyof Edits, value: number) {
		adjust(key, value);
		editor.commit(baseline);
		baseline = '';
	}
</script>

<div class="flex flex-col gap-3">
	{#each AMOUNTS as amount (amount.key)}
		<label class="flex flex-col gap-1 text-[13px]">
			<span class="flex justify-between">
				<span>{t(amount.id)}</span>
				<span class="tabular-nums text-[var(--text-muted)]">{percent(editor.edits[amount.key])}</span>
			</span>
			<Slider
				label={t(amount.id)}
				min={-1}
				max={1}
				step={0.01}
				value={editor.edits[amount.key]}
				oninput={(value) => adjust(amount.key, value)}
				onchange={(value) => finish(amount.key, value)}
			/>
		</label>
	{/each}
</div>
