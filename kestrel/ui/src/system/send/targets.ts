import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';

import { type FileActionEntry, type FileActionShape, fileActions } from '../../extensions/fileActions/actions.js';
import type { Received } from './received.js';

const extensionOf = (name: string) => name.slice(name.lastIndexOf('.') + 1).toLowerCase();

function takesType(shape: FileActionShape, file: Received): boolean {
  if (!shape.types.length && !shape.extensions.length) return true;
  const group = `${file.contentType.slice(0, file.contentType.indexOf('/'))}/*`;
  return shape.types.some(wanted => wanted === file.contentType || wanted === group)
    || shape.extensions.some(wanted => wanted.toLowerCase() === extensionOf(file.name));
}

const takes = (shape: FileActionShape, files: Received[]) =>
  shape.sends && shape.kind !== 'folders' && (shape.multiple || files.length === 1) && files.every(file => takesType(shape, file));

/** Extension actions that send files on, such as Pigeon's devices, with what they show now. */
export function sendingActions(files: Received[]): { entry: FileActionEntry; shape: FileActionShape }[] {
  return fileActions.items.flatMap(entry => {
    const shape = entry.shape();
    return shape && takes(shape, files) ? [{ entry, shape }] : [];
  });
}

/** Apps that say they open every one of the files, apart from the app they come from. */
export function receivingApps(files: Received[], from: Shell.App | null): Gio.AppInfo[] {
  const [first, ...rest] = [...new Set(files.map(file => file.contentType))]
    .map(type => Gio.AppInfo.get_recommended_for_type(type).filter(app => app.should_show() && (app.supports_files() || app.supports_uris())));
  const others = rest.map(apps => new Set(apps.map(app => app.get_id())));
  return (first ?? [])
    .filter(app => app.get_id() !== from?.get_id() && others.every(ids => ids.has(app.get_id())))
    .sort((a, b) => a.get_name().localeCompare(b.get_name()));
}
