<script lang="ts">
	import { t } from '@luft/i18n';
	import Play from '@lucide/svelte/icons/play';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import { basename, errorText, IconButton, Row, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { SOUND_GROUPS } from './catalog';

	const SET = 'set';

	const settings = useSettings<{ custom: Record<string, string> }>('com.lantharos.kestrel.sounds', ['custom']);

	let picking = $state(false);
	let problem = $state<{ where: string; text: string } | null>(null);
	let outcome = $state('');

	let custom = $derived(settings.values.custom ?? {});
	let names = SOUND_GROUPS.flatMap((group) => group.sounds.map((sound) => sound.name));

	async function pick(where: string, choose: () => Promise<unknown>) {
		picking = true;
		problem = null;
		outcome = '';
		try {
			await choose();
		} catch (reason) {
			problem = { where, text: errorText(reason) };
		}
		picking = false;
	}

	const choose = (name: string) => pick(name, () => commands.soundCustomChoose({ name }));

	const chooseSet = () =>
		pick(SET, async () => {
			const set = await commands.soundCustomChooseSet({ names });
			if (!set) return;
			outcome = t('settings-sound-set-used', { count: set.used });
			if (set.skipped.length) outcome += ` ${t('settings-sound-set-skipped', { files: set.skipped.join(', ') })}`;
		});

	function reset(name: string) {
		problem = null;
		void commands.soundCustomReset({ name });
	}

	function resetAll() {
		problem = null;
		outcome = '';
		void commands.soundCustomResetAll();
	}
</script>

{#snippet failure()}
	<p class="text-[13px] text-[var(--danger)]">{problem?.text}</p>
{/snippet}

<Section title={t('settings-sound-set')}>
	<Row title={t('settings-sound-set-folder')} description={outcome || t('settings-sound-set-folder-description')} below={problem?.where === SET ? failure : undefined}>
		{#if Object.keys(custom).length}
			<button type="button" class="button" onclick={resetAll}>{t('settings-sound-reset-all')}</button>
		{/if}
		<button type="button" class="button" disabled={picking} onclick={chooseSet}>{t('settings-sound-set-choose')}</button>
	</Row>
</Section>

{#each SOUND_GROUPS as group (group.title)}
	<Section title={t(group.title)}>
		{#each group.sounds as sound (sound.name)}
			{@const file = custom[sound.name]}
			<Row title={t(sound.title)} description={file ? basename(file) : t('settings-sound-default')} truncate below={problem?.where === sound.name ? failure : undefined}>
				{#if file}
					<IconButton icon={RotateCcw} label={t('settings-sound-reset', { sound: t(sound.title) })} onclick={() => reset(sound.name)} />
				{/if}
				<IconButton icon={Play} label={t('settings-sound-play', { sound: t(sound.title) })} onclick={() => commands.soundPreview({ name: sound.name })} />
				<button type="button" class="button" disabled={picking} aria-label={t('settings-sound-choose-label', { sound: t(sound.title) })} onclick={() => choose(sound.name)}>{t('settings-sound-choose')}</button>
			</Row>
		{/each}
	</Section>
{/each}
