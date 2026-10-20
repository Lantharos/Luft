import Shell from 'gi://Shell';

import { t } from '../../shared/i18n/index.js';

interface AppNames {
  readonly subject: string;
  readonly object: string;
}

function portalApp(appId: string): Shell.App | null {
  return appId ? Shell.AppSystem.get_default().lookup_app(`${appId}.desktop`) : null;
}

export function appName(appId: string): string {
  return portalApp(appId)?.get_name() ?? appId;
}

export function appNames(appId: string): AppNames {
  return appId ? { subject: appName(appId), object: appName(appId) } : { subject: t('portal-unknown-app-subject'), object: t('portal-unknown-app-object') };
}
