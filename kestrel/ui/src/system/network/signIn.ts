import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

const SIGN_IN_APP = 'com.lantharos.signin.desktop';

function signInLink(network: string, url: string): string {
  return `kestrel-signin:?network=${encodeURIComponent(network)}&url=${encodeURIComponent(url)}`;
}

export function signInToNetwork(network: string, url: string): void {
  const context = (global as unknown as Shell.Global).create_app_launch_context(0, -1);
  const app = Shell.AppSystem.get_default().lookup_app(SIGN_IN_APP);
  if (app) app.get_app_info().launch_uris([signInLink(network, url)], context);
  else Gio.AppInfo.launch_default_for_uri(url, context);
}
