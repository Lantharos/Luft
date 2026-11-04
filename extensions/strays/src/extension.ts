import type { Enable } from '@luft/extension-api';

import { Herd } from './herd/herd.js';
import { Library } from './packs/library.js';
import { describePage } from './page.js';

type Granted = 'wallpaper' | 'quick-settings' | 'calls';

const enable: Enable<Granted> = strays => {
  const { settings, t } = strays;
  const sprites = strays.wallpaper.addSprites();
  const library = new Library(strays, sprites);
  const herd = new Herd(strays, sprites);
  const toggle = strays.quickSettings.addToggle({
    title: t('strays'),
    icon: 'icons/strays-symbolic.svg',
    setting: 'on',
    menu: [{ setting: 'count' }, 'separator', 'settings'],
  });

  const populate = () => {
    const on = settings.get<boolean>('on');
    if (on) herd.populate(library.roster, settings.get<number>('count'), settings.get<string>('size'));
    else herd.clear();
    toggle.update({ subtitle: on ? t('around', { count: herd.count }) : null });
  };

  populate();
  settings.onChanged(populate);
  library.watch(populate);
  describePage(strays, library);
};

export default enable;
