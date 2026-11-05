import type { Enable } from '@luft/extension-api';

import { describePage } from './page.js';
import { Playground } from './playground/playground.js';
import type { Kind } from './things/thing.js';

type Granted = 'wallpaper' | 'quick-settings' | 'popups';

const PLACE_KEYS: Record<string, Kind> = { 'lantern-place': 'lantern', 'cloud-place': 'cloud', 'campfire-place': 'campfire', 'star-place': 'stars' };

const enable: Enable<Granted> = playthings => {
  const { settings, t } = playthings;
  const arrange = () => playground.arrange();
  const refresh = () => toggle.update({ subtitle: settings.get<boolean>('on') ? t('around', { count: playground.count }) : null });
  const playground = new Playground(playthings, () => refresh());
  const toggle = playthings.quickSettings.addToggle({
    title: t('playthings'),
    icon: 'icons/playthings-symbolic.svg',
    setting: 'on',
    menu: [{ setting: 'lanterns' }, { setting: 'clouds' }, { setting: 'campfire' }, { setting: 'stars' }, 'separator', { label: t('arrange'), onActivate: arrange }, 'settings'],
  });

  playground.build();
  refresh();
  settings.onChanged(key => {
    const kind = PLACE_KEYS[key];
    if (kind) playground.places.forget(kind);
    playground.build();
    refresh();
  });
  describePage(playthings, playground, arrange);
};

export default enable;
