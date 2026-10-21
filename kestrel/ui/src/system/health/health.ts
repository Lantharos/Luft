import Gio from 'gi://Gio';

const HEALTH_INTERFACE = `<node>
  <interface name="com.lantharos.Kestrel.Health">
    <method name="Check">
      <arg type="t" name="presentation_wait_ms" direction="out"/>
      <arg type="b" name="recovering" direction="out"/>
    </method>
  </interface>
</node>`;

export class Health {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(HEALTH_INTERFACE, this);

  constructor() {
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/Health');
  }

  Check(): [number, boolean] {
    return [Math.floor(global.backend.get_presentation_wait_us() / 1000), global.stage.context.get_backend().is_recovering()];
  }

  destroy(): void {
    this.dbus.unexport();
  }
}
