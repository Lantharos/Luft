import type { Enable, HelperProcess } from '@luft/extension-api';

import { describePage, type State } from './page.js';

const enable: Enable<'helper'> = extension => {
  const { appearance, helper } = extension;
  let process: HelperProcess;
  let state: State = 'starting';
  let sent = '';

  const send = () => {
    const look = JSON.stringify({
      dark: appearance.dark,
      colors: appearance.colors,
      font: appearance.font,
      textScale: appearance.textScale,
      squareCorners: appearance.squareCorners,
      reducedMotion: appearance.reducedMotion,
    });
    if (look === sent) return;
    sent = look;
    void process.write(look);
  };
  const show = (next: State) => {
    state = next;
    extension.settingsPage.refresh();
  };
  const start = () => {
    process = helper.start();
    process.onLine(line => show(line as State));
    sent = '';
    send();
  };
  const retry = () => {
    process.dispose();
    show('starting');
    start();
  };

  describePage(extension, () => state, retry);
  appearance.onChanged(send);
  start();
};

export default enable;
