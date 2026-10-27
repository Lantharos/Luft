import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const GIO_EXPORTED_OBJECT = [
  [
    `        interface SignalSignatures extends GObject.Object.SignalSignatures {}
    }

    class DBusExportedObject {`,
    `        interface SignalSignatures extends DBusInterfaceSkeleton.SignalSignatures {}
    }

    class DBusExportedObject extends DBusInterfaceSkeleton {`,
  ],
  [
    'static wrapJSObject(info: string, obj: any): DBusExportedObject;',
    'static wrapJSObject(info: string | DBusInterfaceInfo, obj: any): DBusExportedObject;',
  ],
  [
    `        // Methods
        get_info(): DBusInterfaceInfo;

        get_connection(): DBusConnection;

        get_object_path(): string;

        unexport_from_connection(connection: DBusConnection): void;

        ["export"](busConnection: DBusConnection, objectPath: string): void;

        unexport(): void;

        flush(): void;

        emit_signal(name: string, variant: GLib.Variant): void;

        emit_property_changed(name: string, variant: GLib.Variant): void;`,
    `        // Methods
        emit_signal(name: string, variant: GLib.Variant | null): void;

        emit_property_changed(name: string, variant: GLib.Variant | null): void;`,
  ],
] as const;

const NM_NUMERIC_NAMES = [
  [
    'export namespace NM {\n',
    `export abstract class NM {
    static readonly '80211Mode': typeof NM.__80211Mode;
    static readonly '80211ApFlags': typeof NM.__80211ApFlags;
    static readonly '80211ApSecurityFlags': typeof NM.__80211ApSecurityFlags;
}

export namespace NM {
`,
  ],
] as const;

function replaceOnce(text: string, before: string, after: string) {
  const [head, ...rest] = text.split(before);
  if (rest.length !== 1) {
    throw new Error(`Expected ts-for-gir to declare this exactly once, found it ${rest.length} times:\n${before}`);
  }
  return head + after + rest[0];
}

async function patch(output: string, file: string, replacements: readonly (readonly [string, string])[]) {
  const path = join(output, file);
  const text = await readFile(path, 'utf8');
  await writeFile(path, replacements.reduce((patched, [before, after]) => replaceOnce(patched, before, after), text));
}

export async function applyGjsOverrides(output: string) {
  await patch(output, 'gio-2.0.d.ts', GIO_EXPORTED_OBJECT);
  await patch(output, 'nm-1.0.d.ts', NM_NUMERIC_NAMES);
}
