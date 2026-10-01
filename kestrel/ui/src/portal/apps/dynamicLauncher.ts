import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import { appNames } from '../core/apps.js';
import { openDialog } from '../core/dialog.js';
import { ENDED, SUCCESS, option, respond, type Invocation, type Options } from '../core/request.js';

const DYNAMIC_LAUNCHER_XML = `<node><interface name="org.freedesktop.impl.portal.DynamicLauncher">
  <method name="PrepareInstall">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="v" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="RequestInstallToken"><arg type="s" direction="in"/><arg type="a{sv}" direction="in"/><arg type="u" direction="out"/></method>
  <property name="SupportedLauncherTypes" type="u" access="read"/>
  <property name="version" type="u" access="read"/>
</interface></node>`;

const APPLICATION = 1;
const WEB_APPLICATION = 2;
const TRUSTED_INSTALLERS = ['com.lantharos.schelf'];

function siteOf(target: string | undefined): string | null {
  return target ? GLib.Uri.parse(target, GLib.UriFlags.NONE).get_host() : null;
}

export class DynamicLauncherPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(DYNAMIC_LAUNCHER_XML, this);
  readonly version = 1;
  readonly SupportedLauncherTypes = APPLICATION | WEB_APPLICATION;

  async PrepareInstallAsync([handle, appId, , name, icon, options]: [string, string, string, string, GLib.Variant, Options], invocation: Invocation): Promise<void> {
    const gicon = Gio.Icon.deserialize(icon);
    if (!gicon) {
      respond(invocation, [ENDED, {}]);
      return;
    }
    const site = option<number>(options, 'launcher_type') === WEB_APPLICATION ? siteOf(option<string>(options, 'target')) : null;
    respond(invocation, await openDialog(handle, {
      title: site ? 'Add this website to your apps?' : 'Add this to your apps?',
      description: site ? `${site} will open in its own window from Start.` : `${appNames(appId).subject} wants to add an app to Start.`,
      icon: 'list-add-symbolic',
    }, dialog => {
      const editable = option<boolean>(options, 'editable_name') ?? true;
      const entry = new St.Entry({ text: name, can_focus: editable, x_expand: true });
      entry.clutter_text.editable = editable;
      const label = new St.Label({ text: 'Name', style_class: 'kestrel-entry-label' });
      entry.label_actor = label;
      const field = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-entry-field', x_expand: true });
      field.add_child(label);
      field.add_child(entry);
      const preview = new St.BoxLayout({ style_class: 'kestrel-portal-launcher' });
      preview.add_child(new St.Icon({ gicon, style_class: 'kestrel-portal-launcher-icon', y_align: Clutter.ActorAlign.END }));
      preview.add_child(field);
      dialog.content.add_child(preview);
      const add = () => dialog.finish(SUCCESS, { name: new GLib.Variant('s', entry.text.trim()), icon: new GLib.Variant('v', icon) });
      const [, addButton] = dialog.buttons([
        { label: 'Cancel', action: dialog.cancel },
        { label: 'Add', action: () => { if (entry.text.trim()) add(); }, default: true },
      ]);
      entry.clutter_text.connect('text-changed', () => { addButton.reactive = addButton.can_focus = !!entry.text.trim(); });
      entry.clutter_text.connect('activate', () => { if (entry.text.trim()) add(); });
      if (editable) dialog.modal.setInitialKeyFocus(entry);
    }));
  }

  RequestInstallToken(appId: string): number {
    return TRUSTED_INSTALLERS.includes(appId) ? SUCCESS : ENDED;
  }
}
