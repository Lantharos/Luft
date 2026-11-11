import Shell from 'gi://Shell';
import { launch, openUri } from '../../../shared/apps/launch.js';

const SIGN_IN_APP = 'com.lantharos.signin.desktop';

function signInLink(network: string, url: string): string {
  return `kestrel-signin:?network=${encodeURIComponent(network)}&url=${encodeURIComponent(url)}`;
}

export function signInToNetwork(network: string, url: string): void {
  const app = Shell.AppSystem.get_default().lookup_app(SIGN_IN_APP);
  if (app) launch(app.get_app_info(), [signInLink(network, url)]);
  else openUri(url);
}
