import GLib from 'gi://GLib';

import {checks} from '../../../lib/check.js';
import type {Point} from '../../../lib/input/input.js';
import {scratch} from '../../../lib/processes.js';
import {withApp} from '../../lib/apps.js';
import {installBrowser} from '../../lib/browser.js';

const {require, eventually} = checks('Luft app');
const REPORT: Point = [660, 345];
const NEW_ISSUE = 'https://github.com/Lantharos/Luft/issues/new';
const RUNNING = '1.2-nightly.21, nightly, build 4c5f0f8a1b6e';

const readRecord = (path: string) => GLib.file_test(path, GLib.FileTest.EXISTS) && new TextDecoder().decode(GLib.file_get_contents(path)[1]);

function fields(address: string) {
  const [page, query = ''] = address.split('?');
  return {page, fields: Object.fromEntries(query.split('&').map(pair => pair.split('=').map(decodeURIComponent)))};
}

export async function checkReport() {
  const record = scratch('settings-report-opened');
  GLib.unlink(record);
  const uninstall = installBrowser(record);
  try {
    await withApp('settings', ['kestrel-settings:system'], async app => {
      await app.settle(() => true);
      (await app.frame()).save('settings-system-report');
      app.click(REPORT);
      const opened = await eventually(() => readRecord(record), 'Report a problem opens the issue tracker in the default browser');
      const {page, fields: sent} = fields(opened);
      require(page === NEW_ISSUE, 'Report a problem opens a new issue on Luft’s tracker');
      require(JSON.stringify(Object.keys(sent).sort()) === JSON.stringify(['template', 'version']),
        'the new issue gets only the bug report form and the version, nothing else about the computer');
      require(sent.template === 'bug.yml' && sent.version === RUNNING, 'the version field holds the running version, channel and build');
    });
  } finally {
    uninstall();
    GLib.unlink(record);
  }
}
