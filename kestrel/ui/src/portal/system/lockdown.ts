import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const LOCKDOWN_XML = `<node><interface name="org.freedesktop.impl.portal.Lockdown">
  <property name="disable-printing" type="b" access="read"/>
  <property name="disable-save-to-disk" type="b" access="read"/>
  <property name="disable-application-handlers" type="b" access="read"/>
  <property name="disable-location" type="b" access="read"/>
  <property name="disable-camera" type="b" access="read"/>
  <property name="disable-microphone" type="b" access="read"/>
  <property name="disable-sound-output" type="b" access="read"/>
</interface></node>`;

interface Source {
  settings: Gio.Settings;
  key: string;
  inverted?: boolean;
}

export class LockdownPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(LOCKDOWN_XML, this);
  private readonly sources: Record<string, Source>;

  constructor() {
    const lockdown = new Gio.Settings({ schema_id: 'org.gnome.desktop.lockdown' });
    const privacy = new Gio.Settings({ schema_id: 'org.gnome.desktop.privacy' });
    const location = new Gio.Settings({ schema_id: 'org.gnome.system.location' });
    this.sources = {
      'disable-printing': { settings: lockdown, key: 'disable-printing' },
      'disable-save-to-disk': { settings: lockdown, key: 'disable-save-to-disk' },
      'disable-application-handlers': { settings: lockdown, key: 'disable-application-handlers' },
      'disable-location': { settings: location, key: 'enabled', inverted: true },
      'disable-camera': { settings: privacy, key: 'disable-camera' },
      'disable-microphone': { settings: privacy, key: 'disable-microphone' },
      'disable-sound-output': { settings: privacy, key: 'disable-sound-output' },
    };
    for (const [property, { settings, key }] of Object.entries(this.sources))
      settings.connect(`changed::${key}`, () => this.dbus.emit_property_changed(property, new GLib.Variant('b', this.value(property))));
  }

  get 'disable-printing'() { return this.value('disable-printing'); }
  get 'disable-save-to-disk'() { return this.value('disable-save-to-disk'); }
  get 'disable-application-handlers'() { return this.value('disable-application-handlers'); }
  get 'disable-location'() { return this.value('disable-location'); }
  get 'disable-camera'() { return this.value('disable-camera'); }
  get 'disable-microphone'() { return this.value('disable-microphone'); }
  get 'disable-sound-output'() { return this.value('disable-sound-output'); }

  private value(property: string): boolean {
    const { settings, key, inverted } = this.sources[property];
    return settings.get_boolean(key) !== !!inverted;
  }
}
