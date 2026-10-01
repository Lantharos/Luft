import Gio from 'gi://Gio';

import { option, type Invocation, type Options } from '../core/request.js';
import { findSession } from '../core/session.js';
import type { ClipboardBridge } from './clipboardBridge.js';
import { InputCaptureSession } from './inputCapture.js';
import { failed, forwardFd } from './mutter.js';
import { RemoteDesktopSession } from './remoteDesktop.js';

const CLIPBOARD_XML = `<node><interface name="org.freedesktop.impl.portal.Clipboard">
  <method name="RequestClipboard"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/></method>
  <method name="SetSelection"><arg type="o" direction="in"/><arg type="a{sv}" direction="in"/></method>
  <method name="SelectionWrite"><arg type="o" direction="in"/><arg type="u" direction="in"/><arg type="h" direction="out"/></method>
  <method name="SelectionWriteDone"><arg type="o" direction="in"/><arg type="u" direction="in"/><arg type="b" direction="in"/></method>
  <method name="SelectionRead"><arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="h" direction="out"/></method>
  <signal name="SelectionOwnerChanged"><arg type="o"/><arg type="a{sv}"/></signal>
  <signal name="SelectionTransfer"><arg type="o"/><arg type="s"/><arg type="u"/></signal>
  <property name="version" type="u" access="read"/>
</interface></node>`;

function clipboardSession(handle: string): RemoteDesktopSession | InputCaptureSession | null {
  return findSession(handle, RemoteDesktopSession) ?? findSession(handle, InputCaptureSession);
}

function withClipboard(handle: string, invocation: Invocation, use: (clipboard: ClipboardBridge) => void): void {
  const clipboard = clipboardSession(handle)?.clipboard;
  if (clipboard) use(clipboard);
  else invocation.return_dbus_error('org.freedesktop.portal.Error.NotAllowed', 'The clipboard isn\'t shared with this session');
}

export class ClipboardPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(CLIPBOARD_XML, this);
  readonly version = 1;

  RequestClipboardAsync([handle]: [string, Options], invocation: Invocation): void {
    const session = clipboardSession(handle);
    if (!session) return invocation.return_dbus_error('org.freedesktop.portal.Error.NotFound', 'No such session');
    session.clipboardRequested = true;
    invocation.return_value(null);
  }

  SetSelectionAsync([handle, options]: [string, Options], invocation: Invocation): void {
    withClipboard(handle, invocation, clipboard => clipboard.setSelection(option<string[]>(options, 'mime_types') ?? [])
      .then(() => invocation.return_value(null)).catch(error => failed(invocation, error)));
  }

  SelectionWriteAsync([handle, serial]: [string, number], invocation: Invocation): void {
    withClipboard(handle, invocation, clipboard => clipboard.write(serial)
      .then(reply => forwardFd(invocation, reply)).catch(error => failed(invocation, error)));
  }

  SelectionWriteDoneAsync([handle, serial, success]: [string, number, boolean], invocation: Invocation): void {
    withClipboard(handle, invocation, clipboard => clipboard.writeDone(serial, success)
      .then(() => invocation.return_value(null)).catch(error => failed(invocation, error)));
  }

  SelectionReadAsync([handle, mimeType]: [string, string], invocation: Invocation): void {
    withClipboard(handle, invocation, clipboard => clipboard.read(mimeType)
      .then(reply => forwardFd(invocation, reply)).catch(error => failed(invocation, error)));
  }
}
