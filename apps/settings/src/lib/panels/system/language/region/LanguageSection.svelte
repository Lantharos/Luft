<script lang="ts">
	import { i18n, LANGUAGES, t } from '@luft/i18n';
	import { Row, Section, Segmented, Select } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { useWeekStart, weekdayName } from '../datetime/weekStart.svelte';
	import { setLanguage } from './api';
	import { FORMATS, formatsName, formatsSample, formatsTag } from './formats';

	const locale = useSettings<{ region: string }>('org.gnome.system.locale', ['region']);
	const weekStart = useWeekStart();

	let problem = $state('');
	let changed = $state(false);

	let language = $derived(LANGUAGES.find((entry) => entry.tag === i18n.locale) ?? LANGUAGES[0]);
	let languages = $derived(LANGUAGES.map((entry) => ({ value: entry.posix, label: entry.name })));
	let region = $derived(locale.values.region ?? '');
	let formats = $derived([
		{ value: '', label: t('settings-region-formats-language') },
		...FORMATS.map((value) => ({ value, label: formatsName(value, i18n.locale) }))
	]);

	const formatsFor = (chosenRegion: string, tag: string) => (chosenRegion ? formatsTag(chosenRegion) : tag);

	async function chooseLanguage(posix: string) {
		const chosen = LANGUAGES.find((entry) => entry.posix === posix);
		if (!chosen) return;
		problem = '';
		try {
			await setLanguage(posix);
			await i18n.use(chosen.tag, formatsFor(region, chosen.tag));
			changed = true;
		} catch (error) {
			problem = String(error);
		}
	}

	async function chooseFormats(value: string) {
		locale.set('region', value);
		await i18n.use(language.tag, formatsFor(value, language.tag));
	}
</script>

<Section>
	<Row title={t('settings-region-language')} description={problem || (changed ? t('settings-region-language-next-sign-in') : t('settings-region-language-description'))}>
		<Select label={t('settings-region-language')} options={languages} value={language.posix} onchange={chooseLanguage} />
	</Row>
	<Row title={t('settings-region-formats')} description={region ? t('settings-region-formats-next-sign-in', { sample: formatsSample(region) }) : t('settings-region-formats-description')}>
		<Select label={t('settings-region-formats')} options={formats} value={region} onchange={chooseFormats} />
	</Row>
	<Row
		title={t('settings-datetime-week-start')}
		description={weekStart.choice === 'automatic' ? t('settings-datetime-week-start-regional', { day: weekdayName(weekStart.regional, 'long') }) : undefined}
	>
		<Segmented
			label={t('settings-datetime-week-start')}
			options={[
				{ value: 'automatic', label: t('settings-datetime-week-start-automatic') },
				{ value: 'monday', label: t('settings-datetime-week-start-monday') },
				{ value: 'sunday', label: t('settings-datetime-week-start-sunday') }
			]}
			value={weekStart.choice}
			onchange={weekStart.choose}
		/>
	</Row>
</Section>
