import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Polkit from 'gi://Polkit';
import PolkitAgent from 'gi://PolkitAgent';

import {delay, INSTRUCTION, MAX_TRIES, openReader, type Reader, RETRIES} from './fprintdPam.js';

export const POLKIT_PASSWORD = 'correct horse';
const FAILURE_DELAY = 400;
const PASSWORD_QUESTION = 'Password: ';

function userName(identity: Polkit.Identity) {
  const uid = (identity as Polkit.UnixUser).get_uid();
  return uid === new Gio.Credentials().get_unix_user() ? GLib.get_user_name() : String(uid);
}

function helperConnection() {
  const address = Gio.dbus_address_get_for_bus_sync(Gio.BusType.SYSTEM, null);
  return Gio.DBusConnection.new_for_address_sync(address,
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
}

export class StandInSession extends PolkitAgent.Session {
  static {
    GObject.registerClass(this);
  }

  private closed: Promise<void> = Promise.resolve();
  private close: () => void = () => {};
  private reader: Reader | null = null;
  private bus: Gio.DBusConnection | null = null;
  private done = false;
  private asked = false;

  override initiate(): void {
    this.closed = new Promise(resolve => (this.close = resolve));
    this.bus = helperConnection();
    void this.converse().catch(() => {});
  }

  override response(response: string): void {
    if (!this.asked || this.done) return;
    this.asked = false;
    if (response === POLKIT_PASSWORD) {
      this.complete(true);
      return;
    }
    void delay(FAILURE_DELAY).then(() => this.complete(false));
  }

  override cancel(): void {
    this.complete(false);
  }

  private async converse() {
    this.reader = await openReader(userName(this.identity), this.closed, this.bus!).catch(() => null);
    if (this.reader && await this.readFingerprint(this.reader)) {
      this.complete(true);
      return;
    }
    this.reader?.stop();
    this.reader = null;
    if (this.done) return;
    this.asked = true;
    this.emit('request', PASSWORD_QUESTION, false);
  }

  private async readFingerprint(reader: Reader) {
    this.emit('show-info', INSTRUCTION);
    for (let tries = MAX_TRIES; ;) {
      const result = await reader.next(null);
      if (this.done) return false;
      if (result! in RETRIES) {
        this.emit('show-error', RETRIES[result!]);
        continue;
      }
      if (result === 'verify-match') return true;
      if (result !== 'verify-no-match' || --tries === 0) return false;
      this.emit('show-error', 'Failed to match fingerprint');
      await reader.verify();
      this.emit('show-info', INSTRUCTION);
    }
  }

  private complete(gained: boolean) {
    if (this.done) return;
    this.done = true;
    this.reader?.stop();
    this.reader = null;
    this.close();
    this.bus?.close(null, null);
    this.emit('completed', gained);
  }
}
