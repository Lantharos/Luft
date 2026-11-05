<script lang="ts">
	import Mic from '@lucide/svelte/icons/mic';
	import MicOff from '@lucide/svelte/icons/mic-off';
	import { Select, Slider, Switch, tooltip } from '@luft/ui';
	import { t } from '@luft/i18n';
	import { app } from '#lib/state/app.svelte.js';

	const SYSTEM_DEFAULT = '';

	let mix = $derived(app.settings?.mix);
	let options = $derived([
		{ value: SYSTEM_DEFAULT, label: t('mic-default') },
		...app.status.microphones.map((microphone) => ({ value: microphone.name, label: microphone.description }))
	]);
	let status = $derived.by(() => {
		if (!app.status.connected) return t('status-off');
		if (!app.status.listeners) return t('status-nobody');
		return t('status-listening', { count: app.status.listeners });
	});
	const percent = (value: number) => `${Math.round(value * 100)}%`;
</script>

{#if mix && app.settings}
	<section class="flex flex-none flex-col gap-3 px-1 pt-2" data-no-drag>
		<p class="px-2 text-[13px] leading-snug text-[var(--sidebar-text-muted)]">{status}</p>

		<div class="flex flex-col gap-2 px-2">
			<div class="flex items-center justify-between gap-2">
				<h2 class="text-[13px] font-medium">{t('mic-title')}</h2>
				<button
					type="button"
					class="mute"
					class:muted={mix.microphoneMuted}
					aria-pressed={mix.microphoneMuted}
					aria-label={mix.microphoneMuted ? t('mic-unmute') : t('mic-mute')}
					{@attach tooltip(mix.microphoneMuted ? t('mic-unmute') : t('mic-mute'))}
					onclick={() => app.setMix({ microphoneMuted: !mix.microphoneMuted })}
				>
					{#if mix.microphoneMuted}<MicOff size={16} />{:else}<Mic size={16} />{/if}
				</button>
			</div>
			<Select
				{options}
				value={mix.microphone ?? SYSTEM_DEFAULT}
				label={t('mic-title')}
				onchange={(value) => app.setMix({ microphone: value || null })}
			/>
			<Slider value={mix.microphoneLevel} max={2} label={t('mic-level')} format={percent} oninput={(microphoneLevel) => app.setMix({ microphoneLevel })} onchange={(microphoneLevel) => app.setMix({ microphoneLevel })} />
			<div class="meter" aria-hidden="true"><span style:transform="scaleX({app.meters.voice})"></span></div>
		</div>

		<div class="flex flex-col gap-2 px-2">
			<div class="flex items-center justify-between gap-2">
				<h2 class="text-[13px] font-medium">{t('monitor-title')}</h2>
				<Switch checked={mix.monitorOn} label={t('monitor-title')} onchange={(monitorOn) => app.setMix({ monitorOn })} />
			</div>
			<Slider value={mix.monitorLevel} label={t('monitor-level')} disabled={!mix.monitorOn} format={percent} oninput={(monitorLevel) => app.setMix({ monitorLevel })} onchange={(monitorLevel) => app.setMix({ monitorLevel })} />
		</div>

		<div class="flex flex-col gap-2 px-2">
			<label class="flex items-center justify-between gap-3 text-[13px]">
				{t('default-input')}
				<Switch checked={app.settings.useAsDefault} label={t('default-input')} onchange={(enabled) => app.setDefaultInput(enabled)} />
			</label>
			<label class="flex items-center justify-between gap-3 text-[13px]">
				{t('keep-running')}
				<Switch checked={app.settings.keepRunning} label={t('keep-running')} onchange={(enabled) => app.setKeepRunning(enabled)} />
			</label>
		</div>
	</section>
{/if}

<style>
	.mute {
		display: grid;
		height: 28px;
		width: 28px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--sidebar-text-muted);
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.mute:hover {
		background: var(--sidebar-control);
	}

	.mute.muted {
		color: var(--text);
		background: var(--sidebar-control);
	}

	.meter {
		height: 3px;
		overflow: hidden;
		border-radius: var(--radius-pill);
		background: var(--sidebar-control);
	}

	.meter span {
		display: block;
		height: 100%;
		background: var(--accent);
		transform-origin: left;
	}
</style>
