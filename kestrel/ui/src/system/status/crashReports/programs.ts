import Shell from 'gi://Shell';

import { developmentPath } from '../../../shared/apps/development.js';
import { luftAppPrograms, runsProgram } from '../../../shared/apps/luftApps.js';
import { t } from '../../../shared/i18n/index.js';

const SHELL = 'kestrel';
const LUFT_APP = 'com.lantharos.';
const DESKTOP_ENTRY = '.desktop';
const BUILT_APPS = developmentPath('KESTREL_LUFT_APPS');

const PARTS: Record<string, string> = {
  'kestrel-post': 'crash-reports-name-post',
  'kestrel-search': 'crash-reports-name-search',
  'kestrel-settings': 'crash-reports-name-desktop-settings',
  'kestrel-watchdog': 'crash-reports-name-watchdog',
  'luft-accounts': 'crash-reports-name-accounts',
  'luft-firewall': 'crash-reports-name-firewall',
  'luft-handwriting': 'crash-reports-name-handwriting',
  'luft-keyring': 'crash-reports-name-keyring',
  'luft-printers': 'crash-reports-name-printers',
  'luft-remote-login': 'crash-reports-name-remote-login',
  'luft-speech': 'crash-reports-name-dictation',
  'luft-thumbnailer': 'crash-reports-name-thumbnails',
  'luft-updater': 'crash-reports-name-updates',
  'luft-usb-protection': 'crash-reports-name-usb-protection',
  'peek': 'crash-reports-name-peek',
  'trustd': 'crash-reports-name-encryption',
};

/** One of Luft's apps by the app ID a report names, or, in a development build, by the program built in this tree. */
function luftApp(program: string): Shell.App | null {
  const appSystem = Shell.AppSystem.get_default();
  if (program.startsWith(LUFT_APP)) return appSystem.lookup_app(`${program}${DESKTOP_ENTRY}`);
  if (!BUILT_APPS) return null;
  const built = `${BUILT_APPS}/${program}`;
  const id = appSystem.get_installed()
    .map(info => info.get_id() ?? '')
    .find(id => id.startsWith(LUFT_APP) && runsProgram(built, luftAppPrograms(id.slice(0, -DESKTOP_ENTRY.length))));
  return id ? appSystem.lookup_app(id) : null;
}

/** What closed, in words people know: an app by its name, the desktop, a part of Luft by what it does, or a part of Luft. */
export function closedTitle(program: string): string {
  if (program === SHELL) return t('crash-reports-title-desktop');
  const app = luftApp(program);
  if (app) return t('crash-reports-title-app', { app: app.get_name() });
  const part = PARTS[program];
  return part ? t('crash-reports-title-app', { app: t(part) }) : t('crash-reports-title-part');
}
