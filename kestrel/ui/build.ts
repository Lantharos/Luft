import { build, type Plugin } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const [entry, output, configJson] = process.argv.slice(2);

if (!entry || !output || !configJson) {
  throw new Error('An entry file, an output path and the build configuration are required');
}

const config = JSON.parse(configJson) as Record<string, string>;
const mutterVersion = config.LIBMUTTER_API_VERSION;
const MUTTER_NAMESPACES = ['Clutter', 'Cogl', 'Meta', 'Mtk', 'Shell', 'St'];
const TYPELIB_VERSIONS: Record<string, string> = {
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
  UPowerGlib: '1.0',
};

const typelibVersions: Plugin = {
  name: 'typelib-versions',
  setup(builder) {
    builder.onResolve({ filter: /^gi:\/\// }, ({ path }) => {
      if (path.includes('?version=')) return { path, external: true };
      const namespace = path.slice('gi://'.length);
      const version = MUTTER_NAMESPACES.includes(namespace) ? mutterVersion : TYPELIB_VERSIONS[namespace];
      if (!version) return { errors: [{ text: `${namespace} needs a typelib version in build.ts` }] };
      return { path: `gi://${namespace}?version=${version}`, external: true };
    });
  },
};

const result = await build({
  entryPoints: [join(import.meta.dir, 'src', entry)],
  outfile: output,
  bundle: true,
  metafile: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  nodePaths: [join(import.meta.dir, 'node_modules')],
  external: ['resource:///*', 'cairo', 'gettext', 'console', 'system', 'gi'],
  define: Object.fromEntries(Object.entries(config).map(([key, value]) => [`KESTREL_CONFIG.${key}`, JSON.stringify(value)])),
  plugins: [typelibVersions],
  write: false,
});

const asciiOnly = (code: string) => code.replace(/[^\x00-\x7f]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
await writeFile(output, asciiOnly(result.outputFiles[0].text));

const sources = Object.keys(result.metafile.inputs).map(input => resolve(input).replaceAll(' ', '\\ '));
await writeFile(`${output}.d`, `${output}: ${sources.join(' ')}\n`);
