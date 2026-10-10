import { openDialog } from '../../../portal/core/dialog.js';
import { SUCCESS } from '../../../portal/core/request.js';
import type { Caller } from './callers.js';

export type Level = 'see' | 'use';
export type Answer = 'deny' | 'once' | 'until-quit';

const COPY: Record<Level, { title: (name: string) => string; description: string; icon: string }> = {
  see: {
    title: name => `${name} wants to see your windows`,
    description: 'It will be able to take pictures of any window you have open.',
    icon: 'focus-windows-symbolic',
  },
  use: {
    title: name => `${name} wants to see and use your windows`,
    description: 'It will be able to see any window you have open, and click and type in it as if it were you.',
    icon: 'input-mouse-symbolic',
  },
};

export async function askForAccess(caller: Caller, level: Level): Promise<Answer> {
  const copy = COPY[level];
  let answer: Answer = 'deny';
  const choose = (choice: Answer, finish: (response: number) => void) => () => {
    answer = choice;
    finish(SUCCESS);
  };
  await openDialog(null, { title: copy.title(caller.name), description: copy.description, icon: copy.icon, styleClass: 'kestrel-peek-dialog' }, dialog => {
    dialog.content.hide();
    dialog.buttons([
      { label: 'Don’t allow', action: dialog.cancel },
      { label: 'Allow once', action: choose('once', dialog.finish) },
      { label: 'Allow until it quits', action: choose('until-quit', dialog.finish) },
    ]);
  });
  return answer;
}
