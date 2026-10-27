import type { Plugin } from 'esbuild';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const MUTTER_NAMESPACES = ['Clutter', 'Cogl', 'Meta', 'Mtk', 'Shell', 'St'];
export const TYPELIB_VERSIONS: Record<string, string> = {
  AccountsService: '1.0',
  Atk: '1.0',
  Atspi: '2.0',
  cairo: '1.0',
  GDesktopEnums: '3.0',
  Gdk: '4.0',
  GdkPixbuf: '2.0',
  Gio: '2.0',
  GioUnix: '2.0',
  GLib: '2.0',
  GLibUnix: '2.0',
  Gly: '2',
  GObject: '2.0',
  Graphene: '1.0',
  Gst: '1.0',
  Gtk: '4.0',
  GUdev: '1.0',
  IBus: '1.0',
  NM: '1.0',
  Pango: '1.0',
  PangoCairo: '1.0',
  Polkit: '1.0',
  PolkitAgent: '1.0',
  Soup: '3.0',
};

export function mutterApiVersion(): string {
  const meson = readFileSync(join(import.meta.dir, '../engine/meson.build'), 'utf8');
  const version = /^mutter_api_version = '(\d+)'$/m.exec(meson)?.[1];
  if (!version) throw new Error('kestrel/engine/meson.build names no mutter_api_version');
  return version;
}

export function typelibVersions(mutterVersion: string): Plugin {
  return {
    name: 'typelib-versions',
    setup(builder) {
      builder.onResolve({ filter: /^gi:\/\// }, ({ path }) => {
        if (path.includes('?version=')) return { path, external: true };
        const namespace = path.slice('gi://'.length);
        const version = MUTTER_NAMESPACES.includes(namespace) ? mutterVersion : TYPELIB_VERSIONS[namespace];
        if (!version) return { errors: [{ text: `${namespace} needs a typelib version in kestrel/ui/typelibs.ts` }] };
        return { path: `gi://${namespace}?version=${version}`, external: true };
      });
    },
  };
}
