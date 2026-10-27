import type Gio from 'gi://Gio';

export type Publish = (xml: string, implementation: object, path: string) => Gio.DBusExportedObject;
