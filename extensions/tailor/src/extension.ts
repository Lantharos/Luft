import type { Enable, HelperProcess, Settings } from '@luft/extension-api';

import { APPS, type AppId, describePage, type Report, type States } from './page.js';

const isApp = (app: string): app is AppId => (APPS as readonly string[]).includes(app);

const wanted = (settings: Settings) => Object.fromEntries(APPS.map(app => [app, settings.get<boolean>(app)]));

const enable: Enable<'helper'> = extension => {
  const { appearance, helper, settings, settingsPage } = extension;
  const states: States = {};
  let process: HelperProcess;
  let sent = '';

  const send = () => {
    const message = JSON.stringify({
      look: {
        dark: appearance.dark,
        colors: appearance.colors,
        font: appearance.font,
        textScale: appearance.textScale,
        squareCorners: appearance.squareCorners,
        reducedMotion: appearance.reducedMotion,
      },
      apps: wanted(settings),
    });
    if (message === sent) return;
    sent = message;
    void process.write(message);
  };
  const hear = (line: string) => {
    const report = JSON.parse(line) as Report;
    if ('found' in report) settings.set('found', report.found.filter(isApp));
    else if (isApp(report.app)) states[report.app] = { state: report.state, detail: report.detail };
    else return;
    settingsPage.refresh();
  };
  const start = () => {
    process = helper.start();
    process.onLine(hear);
    sent = '';
    send();
  };
  const retry = () => {
    process.dispose();
    for (const app of APPS) delete states[app];
    settingsPage.refresh();
    start();
  };

  describePage(extension, states, retry);
  appearance.onChanged(send);
  settings.onChanged(send);
  start();
};

export default enable;
