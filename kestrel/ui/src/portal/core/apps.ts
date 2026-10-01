import Shell from 'gi://Shell';

export interface AppNames {
  readonly subject: string;
  readonly object: string;
}

export function portalApp(appId: string): Shell.App | null {
  return appId ? Shell.AppSystem.get_default().lookup_app(`${appId}.desktop`) : null;
}

export function appName(appId: string): string {
  return portalApp(appId)?.get_name() ?? appId;
}

export function appNames(appId: string): AppNames {
  return appId ? { subject: appName(appId), object: appName(appId) } : { subject: 'The app', object: 'the app' };
}
