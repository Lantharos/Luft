import type { PageItem, PageSection } from '@luft/extension-api';

import type { Keystrokes } from './keystrokes.js';
import type { Pack } from './packs/pack.js';
import { PackProblem } from './packs/read.js';

const GUIDE = 'https://docs.luft.computer/personalize/keystrokes/';
const BUILT_IN_NAMES: Record<string, string> = {
  mechanical: 'mechanical-name',
  membrane: 'membrane-name',
  typewriter: 'typewriter-name',
  thock: 'thock-name',
};
const BUILT_IN_DESCRIPTIONS: Record<string, string> = {
  mechanical: 'mechanical-description',
  membrane: 'membrane-description',
  typewriter: 'typewriter-description',
  thock: 'thock-description',
};

/** The Settings page of Keystrokes: what plays, what it can and can't see, and everything about adding sounds of your own. */
export function describePage(keystrokes: Keystrokes): void {
  const { extension, library } = keystrokes;
  const { t } = extension;
  let problem: string | null = null;

  const add = async () => {
    const [folder] = await extension.pickFiles({ title: t('add-pack'), kind: 'folder' });
    if (!folder) return;
    problem = null;
    try {
      await keystrokes.add(folder);
    } catch (error) {
      if (!(error instanceof PackProblem)) throw error;
      problem = t(error.id, error.args);
    }
    extension.settingsPage.refresh();
  };

  const nameOf = (pack: Pack) => library.isBuiltIn(pack) ? t(BUILT_IN_NAMES[pack.id]) : pack.name;
  const descriptionOf = (pack: Pack) => library.isBuiltIn(pack) ? t(BUILT_IN_DESCRIPTIONS[pack.id]) : pack.description ?? undefined;

  const packRow = (pack: Pack) => ({
    title: nameOf(pack),
    description: pack === keystrokes.current ? t('in-use') : descriptionOf(pack),
    actions: [
      pack === keystrokes.current ? { label: t('listen'), onActivate: () => keystrokes.sample() } : { label: t('use'), onActivate: () => void keystrokes.use(pack) },
      ...library.isBuiltIn(pack) ? [] : [{ label: t('remove-pack'), danger: true, onActivate: () => void keystrokes.remove(pack) }],
    ],
  });

  extension.settingsPage.describe((): PageSection[] => [
    { items: [{ setting: 'keys' }, { setting: 'key-volume' }, { setting: 'clicks' }, { setting: 'click-volume' }] },
    { title: t('sounds'), items: [{ type: 'list', items: library.packs.map(packRow) }] },
    { title: t('privacy'), description: t('privacy-detail'), items: [{ type: 'text', text: t('privacy-limit') }] },
    {
      title: t('make-your-own'),
      description: t('make-your-own-detail'),
      items: [
        ...problem ? [{ type: 'text', text: problem } as PageItem] : [],
        { type: 'button', title: t('add-pack'), description: t('add-pack-detail'), label: t('add-pack-button'), onActivate: () => void add() },
        { type: 'button', title: t('template'), description: t('template-detail'), label: t('template-button'), onActivate: () => extension.open(`file://${extension.path}/template`) },
        { type: 'button', title: t('guide'), description: t('guide-detail'), label: t('guide-button'), onActivate: () => extension.open(GUIDE) },
      ],
    },
  ]);
  keystrokes.onChanged(() => extension.settingsPage.refresh());
}
