import Gio from 'gi://Gio';

import { ENDED, SUCCESS, respond, type Invocation, type Options, type Outcome } from '../core/request.js';
import { findSession } from '../core/session.js';
import { chooseSources } from './dialogs/screenCastDialog.js';
import { PeerSession } from './peerSession.js';
import { Recording } from './recording.js';
import { RemoteDesktopSession } from './remoteDesktop.js';
import { DONT_PERSIST, persistMode, persisted, storedChoice, type StoredChoice } from './restore.js';
import { MONITOR, VIRTUAL, WINDOW, restoredSources, selectionFrom, storedSources, type Selection, type Source, type StoredSource } from './sources.js';

const SCREEN_CAST_XML = `<node><interface name="org.freedesktop.impl.portal.ScreenCast">
  <method name="CreateSession">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="SelectSources">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="Start">
    <arg type="o" direction="in"/><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <property name="AvailableSourceTypes" type="u" access="read"/>
  <property name="AvailableCursorModes" type="u" access="read"/>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const STORED_SOURCES = 'a(uuv)';
const HIDDEN = 1;
const EMBEDDED = 2;
const METADATA = 4;

class ScreenCastSession extends PeerSession {
  private selection: Selection | null = null;
  private persistMode = DONT_PERSIST;
  private stored: StoredChoice<[StoredSource[]]> | null = null;
  private recording: Recording | null = null;
  private starting = false;

  selectSources(selection: Selection, options: Options): void {
    this.selection = selection;
    this.persistMode = persistMode(options);
    this.stored = storedChoice(options, STORED_SOURCES);
  }

  async start(handle: string): Promise<Outcome> {
    if (!this.selection || this.starting || this.recording) return [ENDED, {}];
    this.starting = true;
    try {
      return await this.share(handle, this.selection);
    } finally {
      this.starting = false;
    }
  }

  private async choose(handle: string, selection: Selection): Promise<[number, Source[] | null, number]> {
    const restored = this.stored && restoredSources(this.stored.values[0], selection.types);
    if (restored) return [SUCCESS, restored, this.persistMode];
    const [response, choice] = await chooseSources(handle, this.appId, selection, this.persistMode, this.track);
    this.track(null);
    return [response, choice?.sources ?? null, choice?.remember ? this.persistMode : DONT_PERSIST];
  }

  private async share(handle: string, selection: Selection): Promise<Outcome> {
    const [response, sources, persist] = await this.choose(handle, selection);
    if (!sources) return [response, {}];
    if (!this.active) return [ENDED, {}];
    try {
      this.recording = await Recording.create(() => this.close());
      if (!this.active) throw new Error('The app stopped sharing');
      await this.recording.record(sources, selection);
      await this.recording.start();
    } catch (error) {
      console.warn(`Couldn't share the screen with ${this.appId || 'an app'}: ${(error as Error).message}`);
      this.recording?.stop();
      this.recording = null;
      return [ENDED, {}];
    }
    return [SUCCESS, {
      streams: this.recording.results,
      ...persisted(persist, STORED_SOURCES, this.stored?.created, [storedSources(sources)]),
    }];
  }

  protected stopped(): void {
    this.recording?.stop();
  }
}

export class ScreenCastPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(SCREEN_CAST_XML, this);
  readonly version = 5;
  readonly AvailableSourceTypes = MONITOR | WINDOW | VIRTUAL;
  readonly AvailableCursorModes = HIDDEN | EMBEDDED | METADATA;

  CreateSessionAsync([, sessionHandle, appId]: [string, string, string, Options], invocation: Invocation): void {
    new ScreenCastSession(sessionHandle, appId, invocation.get_sender()!);
    respond(invocation, [SUCCESS, {}]);
  }

  SelectSourcesAsync([, sessionHandle, , options]: [string, string, string, Options], invocation: Invocation): void {
    const selection = selectionFrom(options);
    const session = findSession(sessionHandle, ScreenCastSession) ?? findSession(sessionHandle, RemoteDesktopSession);
    if (!selection || !session) return respond(invocation, [ENDED, {}]);
    session.selectSources(selection, options);
    respond(invocation, [SUCCESS, {}]);
  }

  async StartAsync([handle, sessionHandle]: [string, string, string, string, Options], invocation: Invocation): Promise<void> {
    const session = findSession(sessionHandle, ScreenCastSession);
    respond(invocation, session ? await session.start(handle) : [ENDED, {}]);
  }
}
