import type { Extension, PageItem, PageSection } from '@luft/extension-api';

import { type Landing, LIMITS, type Preset, Presets } from './presets.js';

const MOST_PICTURES = 8;
const LANDINGS: Record<Landing, string> = { bounce: 'custom-bounce', settle: 'custom-settle', through: 'custom-through' };

function pictureItems(seasons: Extension, presets: Presets, preset: Preset): PageItem[] {
  const { t } = seasons;
  return [
    {
      type: 'list',
      items: preset.pictures.map((picture, index) => ({
        title: t('custom-picture', { number: index + 1 }),
        image: picture,
        actions: [{ label: t('custom-remove'), onActivate: () => presets.forgetPicture(preset.id, picture) }],
      })),
      empty: t('custom-no-pictures'),
    },
    {
      type: 'button',
      title: t('custom-add-pictures'),
      description: t('custom-add-pictures-detail'),
      label: t('custom-add'),
      onActivate: () => void seasons.pickFiles({ title: t('custom-add-pictures'), kind: 'images', multiple: true }).then(picked => {
        const current = presets.all.find(candidate => candidate.id === preset.id);
        if (!current) return;
        const keep = picked.slice(0, Math.max(0, MOST_PICTURES - current.pictures.length));
        for (const extra of picked.slice(keep.length)) seasons.deleteFile(extra);
        presets.update(preset.id, { pictures: [...current.pictures, ...keep] });
      }),
    },
  ];
}

function motionItems(seasons: Extension, presets: Presets, preset: Preset): PageItem[] {
  const { t } = seasons;
  const slide = (title: string, key: 'amount' | 'speed' | 'wind' | 'spin', [min, max]: readonly [number, number], step: number, unit?: 'percent'): PageItem => ({
    type: 'slider', title: t(title), value: preset[key], min, max, step, unit,
    onChanged: value => presets.update(preset.id, { [key]: value }),
  });
  return [
    slide('custom-amount', 'amount', LIMITS.amount, 0.05, 'percent'),
    {
      type: 'slider', title: t('custom-smallest'), value: preset.smallest, min: LIMITS.size[0], max: LIMITS.size[1], step: 2,
      onChanged: value => presets.update(preset.id, { smallest: value, largest: Math.max(value, preset.largest) }),
    },
    {
      type: 'slider', title: t('custom-largest'), value: preset.largest, min: LIMITS.size[0], max: LIMITS.size[1], step: 2,
      onChanged: value => presets.update(preset.id, { largest: value, smallest: Math.min(value, preset.smallest) }),
    },
    slide('custom-speed', 'speed', LIMITS.speed, 10),
    slide('custom-wind', 'wind', LIMITS.wind, 0.05),
    slide('custom-spin', 'spin', LIMITS.spin, 0.05, 'percent'),
    {
      type: 'choice', title: t('custom-landing'), value: preset.landing,
      options: Object.entries(LANDINGS).map(([landing, label]) => ({ value: landing, label: t(label) })),
      onChanged: value => presets.update(preset.id, { landing: value as Landing }),
    },
  ];
}

function soundItems(seasons: Extension, presets: Presets, preset: Preset): PageItem[] {
  const { t } = seasons;
  const pick = () => void seasons.pickFiles({ title: t('custom-impact'), kind: 'sounds' }).then(([picked]) => {
    if (!picked) return;
    const previous = preset.impact;
    presets.update(preset.id, { impact: picked });
    if (previous && !presets.all.some(other => other.impact === previous)) seasons.deleteFile(previous);
  });
  return [
    { type: 'button', title: t('custom-impact'), description: t('custom-impact-detail'), label: preset.impact ? t('custom-change') : t('custom-pick'), onActivate: pick },
    ...preset.impact ? [{ type: 'button', title: t('custom-no-impact'), label: t('custom-remove'), onActivate: () => presets.update(preset.id, { impact: null }) } as PageItem] : [],
  ];
}

/** The part of Seasons' page where people make sets of their own pictures to fall. */
export function customSections(seasons: Extension, presets: Presets, show: () => void): PageSection[] {
  const { t } = seasons;
  const preset = presets.chosen;
  const create = () => presets.create(t('custom-untitled', { number: presets.all.length + 1 }));
  if (!preset) {
    return [{
      title: t('custom'), description: t('custom-detail'),
      items: [{ type: 'button', title: t('custom-first'), label: t('custom-new'), onActivate: create }],
    }];
  }
  return [
    {
      title: t('custom'), description: t('custom-detail'),
      items: [
        {
          type: 'choice', title: t('custom-set'), value: preset.id,
          options: presets.all.map(each => ({ value: each.id, label: each.name, image: each.pictures[0] })),
          onChanged: id => presets.choose(id),
        },
        { type: 'entry', title: t('custom-name'), value: preset.name, onSubmit: name => name.trim() && presets.update(preset.id, { name: name.trim() }) },
        { type: 'button', title: t('custom-show'), description: t('custom-show-detail'), label: t('custom-show-button'), onActivate: show },
        { type: 'button', title: t('custom-another'), label: t('custom-new'), onActivate: create },
      ],
    },
    { title: t('custom-pictures'), items: pictureItems(seasons, presets, preset) },
    { title: t('custom-motion'), items: motionItems(seasons, presets, preset) },
    { title: t('custom-sound'), items: soundItems(seasons, presets, preset) },
    { items: [{ type: 'button', title: t('custom-delete'), label: t('custom-delete-button'), danger: true, onActivate: () => presets.remove(preset.id) }] },
  ];
}
