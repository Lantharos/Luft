import type { Extension, PageItem } from '@luft/extension-api';

import type { Library } from './packs/library.js';
import type { Pack } from './packs/pack.js';
import { PackProblem } from './packs/read.js';

const GUIDE = 'https://docs.luft.computer/personalize/strays/';
const PREVIEW_RATE = 6;
const WALK_LOOPS = 3;

function previewFrames({ frames }: Pack): number[] {
  return [...frames.look, ...Array.from({ length: WALK_LOOPS }, () => frames.walk).flat(), ...frames.sitDown, frames.sit, frames.sit, ...frames.lieDown, frames.sleep, frames.sleep, frames.sleep];
}

/** The Settings page of Strays: how many, who, and everything about adding creatures of your own. */
export function describePage(strays: Extension, library: Library): void {
  const { t } = strays;
  let problem: string | null = null;

  const add = async () => {
    const [folder] = await strays.pickFiles({ title: t('add-pack'), kind: 'folder' });
    if (!folder) return;
    problem = null;
    try {
      library.add(folder);
    } catch (error) {
      if (!(error instanceof PackProblem)) throw error;
      problem = t(error.id, error.args);
      strays.settingsPage.refresh();
    }
  };

  const packRow = (pack: Pack): PageItem => {
    const builtIn = library.isBuiltIn(pack);
    return {
      type: 'sprite',
      title: pack.name,
      description: (builtIn ? t(`${pack.id}-description`) : pack.description) ?? undefined,
      image: pack.sheet,
      cell: pack.frameSheet.cell,
      columns: pack.frameSheet.columns,
      frames: previewFrames(pack),
      rate: PREVIEW_RATE,
      checked: library.isOn(pack),
      onToggled: on => library.turn(pack, on),
      actions: builtIn ? [] : [{ label: t('remove-pack'), onActivate: () => library.remove(pack) }],
    };
  };

  strays.settingsPage.describe(() => [
    { items: [{ setting: 'count' }, { setting: 'size' }] },
    { title: t('who'), items: library.packs.map(packRow) },
    {
      title: t('make-your-own'),
      description: t('make-your-own-detail'),
      items: [
        ...problem ? [{ type: 'text', text: problem } as PageItem] : [],
        { type: 'button', title: t('add-pack'), description: t('add-pack-detail'), label: t('add-pack-button'), onActivate: () => void add() },
        { type: 'button', title: t('template'), description: t('template-detail'), label: t('template-button'), onActivate: () => strays.open(`file://${strays.path}/template`) },
        { type: 'button', title: t('guide'), description: t('guide-detail'), label: t('guide-button'), onActivate: () => strays.open(GUIDE) },
      ],
    },
  ]);
  library.watch(() => strays.settingsPage.refresh());
}
