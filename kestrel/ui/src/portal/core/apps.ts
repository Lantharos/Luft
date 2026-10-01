import Shell from 'gi://Shell';

export function portalApp(appId: string): Shell.App | null {
  return appId ? Shell.AppSystem.get_default().lookup_app(`${appId}.desktop`) : null;
}

export function appName(appId: string): string {
  return portalApp(appId)?.get_name() ?? (appId || 'An app');
}
