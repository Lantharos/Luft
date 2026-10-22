import { openDialog } from '../../../portal/core/dialog.js';
import { SUCCESS } from '../../../portal/core/request.js';
import { t } from '../../../shared/i18n/index.js';

export type Level = 'see' | 'use';
export type Answer = 'deny' | 'once' | 'until-quit';

const COPY: Record<Level, { title: string; description: string; icon: string }> = {
  see: { title: 'peek-see-request', description: 'peek-see-description', icon: 'focus-windows-symbolic' },
  use: { title: 'peek-use-request', description: 'peek-use-description', icon: 'input-mouse-symbolic' },
};

export async function askForAccess(level: Level): Promise<Answer> {
  const copy = COPY[level];
  let answer: Answer = 'deny';
  const choose = (choice: Answer, finish: (response: number) => void) => () => {
    answer = choice;
    finish(SUCCESS);
  };
  await openDialog(null, { title: t(copy.title), description: t(copy.description), icon: copy.icon, styleClass: 'kestrel-peek-dialog', askedBy: '' }, dialog => {
    dialog.content.hide();
    dialog.buttons([
      { label: t('peek-deny'), action: dialog.cancel },
      { label: t('peek-allow-once'), action: choose('once', dialog.finish) },
      { label: t('peek-allow-until-quit'), action: choose('until-quit', dialog.finish) },
    ]);
  });
  return answer;
}
