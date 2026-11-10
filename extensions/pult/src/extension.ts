import type { Enable, Popup } from '@luft/extension-api';

import { type Granted, SERVER } from './client.js';
import { compact } from './element.js';
import { describePage } from './page.js';
import { waitingView } from './popup.js';
import { Pult } from './pult.js';
import { addSearch } from './search.js';

const enable: Enable<Granted> = extension => {
  const pult = new Pult(extension);
  let popup: Popup | null = null;

  const shown = () => !extension.settings.get<boolean>('hide-empty') || pult.count > 0;
  const element = extension.taskbar.addElement({
    key: 'pult',
    label: extension.t('waiting-in-pult'),
    shown: shown(),
    content: layout => compact(pult, layout),
    onClick: () => {
      if (popup?.open) {
        popup.dispose();
        return;
      }
      if (pult.client.signedIn) void pult.refresh();
      popup = extension.popups.open({ anchor: element, title: extension.t('pult'), width: 320, content: waitingView(pult) });
    },
    menu: [{ label: extension.t('open-pult'), onActivate: () => extension.open(SERVER) }, 'settings'],
  });

  const changed = () => {
    element.update({ shown: shown() });
    element.refresh();
    if (popup?.open) popup.update(waitingView(pult));
  };
  pult.onChanged(changed);
  extension.settings.onChanged(changed);
  describePage(pult);
  addSearch(pult);
  return pult.start();
};

export default enable;
