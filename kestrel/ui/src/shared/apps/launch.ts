import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export function launchContext(app: Gio.AppInfo | null = null): Gio.AppLaunchContext {
  return global.create_launch_context_for_app(app, 0, -1);
}

function requireAddresses(uris: string[]): void {
  const plain = uris.find(uri => !GLib.Uri.peek_scheme(uri));
  if (plain !== undefined) throw new Error(`“${plain}” isn't an address`);
}

export function launch(app: Gio.AppInfo, uris: string[] = []): void {
  requireAddresses(uris);
  app.launch_uris(uris, launchContext(app));
}

function schemeHandler(uri: string): Gio.AppInfo | null {
  requireAddresses([uri]);
  return Gio.AppInfo.get_default_for_uri_scheme(GLib.Uri.peek_scheme(uri)!);
}

export function openUri(uri: string): void {
  launch(schemeHandler(uri) ?? Gio.File.new_for_uri(uri).query_default_handler(null), [uri]);
}

export function openUriAsync(uri: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const app = schemeHandler(uri);
      if (app) {
        launch(app, [uri]);
        resolve();
        return;
      }
    } catch (error) {
      reject(error);
      return;
    }
    Gio.File.new_for_uri(uri).query_default_handler_async(GLib.PRIORITY_DEFAULT, null, (file, result) => {
      try {
        launch(file!.query_default_handler_finish(result), [uri]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}
