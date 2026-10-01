import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';

import { ENDED, SUCCESS, option, respond, type Invocation, type Options } from '../core/request.js';

const EMAIL_XML = `<node><interface name="org.freedesktop.impl.portal.Email">
  <method name="ComposeEmail">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
</interface></node>`;

function escape(text: string, allowed = ''): string {
  return GLib.uri_escape_string(text, allowed, false);
}

function mailtoUri(options: Options): string {
  const recipients = [option<string>(options, 'address'), ...option<string[]>(options, 'addresses') ?? []].filter((address): address is string => !!address);
  const fields: [string, string][] = [];
  for (const key of ['cc', 'bcc']) {
    const addresses = option<string[]>(options, key);
    if (addresses?.length) fields.push([key, addresses.map(address => escape(address, '@')).join(',')]);
  }
  for (const key of ['subject', 'body']) {
    const text = option<string>(options, key);
    if (text) fields.push([key, escape(text)]);
  }
  for (const path of option<string[]>(options, 'attachments') ?? []) fields.push(['attachment', escape(path, '/')]);
  const query = fields.map(([key, value]) => `${key}=${value}`).join('&');
  return `mailto:${recipients.map(address => escape(address, '@')).join(',')}${query ? `?${query}` : ''}`;
}

export class EmailPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(EMAIL_XML, this);

  ComposeEmailAsync([, , , options]: [string, string, string, Options], invocation: Invocation): void {
    const mailer = Gio.AppInfo.get_default_for_uri_scheme('mailto');
    if (!mailer) {
      respond(invocation, [ENDED, {}]);
      return;
    }
    try {
      mailer.launch_uris([mailtoUri(options)], (global as unknown as Shell.Global).create_app_launch_context(0, -1));
      respond(invocation, [SUCCESS, {}]);
    } catch (error) {
      console.warn(`Couldn't compose an email in ${mailer.get_name()}: ${error}`);
      respond(invocation, [ENDED, {}]);
    }
  }
}
