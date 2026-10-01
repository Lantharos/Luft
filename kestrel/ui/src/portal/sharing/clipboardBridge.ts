import type Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Options } from '../core/request.js';
import { mutterCall, mutterCallWithFd, mutterObject, mutterSignals, type MutterObject } from './mutter.js';
import type { PeerSession } from './peerSession.js';

const CLIPBOARD = 'org.freedesktop.impl.portal.Clipboard';

interface OwnerChange {
  'mime-types'?: string[];
  'session-is-owner'?: boolean;
}

export class ClipboardBridge {
  private readonly unsubscribe: () => void;

  private constructor(private readonly clipboard: MutterObject, owner: PeerSession) {
    const { handle } = owner;
    const emit = (signal: string, parameters: GLib.Variant) => owner.emit(CLIPBOARD, signal, parameters);
    this.unsubscribe = mutterSignals(clipboard, {
      SelectionOwnerChanged: changed => {
        const [change] = changed.recursiveUnpack() as [OwnerChange];
        const options: Options = {};
        if (change['mime-types']) options.mime_types = new GLib.Variant('as', change['mime-types']);
        if (change['session-is-owner'] !== undefined) options.session_is_owner = new GLib.Variant('b', change['session-is-owner']);
        emit('SelectionOwnerChanged', new GLib.Variant('(oa{sv})', [handle, options]));
      },
      SelectionTransfer: transfer => {
        const [mimeType, serial] = transfer.deep_unpack() as [string, number];
        emit('SelectionTransfer', new GLib.Variant('(osu)', [handle, mimeType, serial]));
      },
    });
  }

  static async enable(name: string, path: string, owner: PeerSession): Promise<ClipboardBridge> {
    const bridge = new ClipboardBridge(mutterObject(name, path, 'org.gnome.Mutter.Clipboard'), owner);
    try {
      await mutterCall(bridge.clipboard, 'Enable', new GLib.Variant('(a{sv})', [{}]));
    } catch (error) {
      bridge.unsubscribe();
      throw error;
    }
    return bridge;
  }

  setSelection(mimeTypes: string[]): Promise<GLib.Variant> {
    return mutterCall(this.clipboard, 'SetSelection', new GLib.Variant('(a{sv})', [{ 'mime-types': new GLib.Variant('as', mimeTypes) }]));
  }

  write(serial: number): Promise<[GLib.Variant, Gio.UnixFDList | null]> {
    return mutterCallWithFd(this.clipboard, 'SelectionWrite', new GLib.Variant('(u)', [serial]));
  }

  writeDone(serial: number, success: boolean): Promise<GLib.Variant> {
    return mutterCall(this.clipboard, 'SelectionWriteDone', new GLib.Variant('(ub)', [serial, success]));
  }

  read(mimeType: string): Promise<[GLib.Variant, Gio.UnixFDList | null]> {
    return mutterCallWithFd(this.clipboard, 'SelectionRead', new GLib.Variant('(s)', [mimeType]));
  }

  disable(): void {
    this.unsubscribe();
    mutterCall(this.clipboard, 'Disable').catch(() => {});
  }
}
