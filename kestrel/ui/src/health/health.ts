import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';

const HEALTH_INTERFACE = `<node>
  <interface name="com.lantharos.Kestrel.Health">
    <method name="Check">
      <arg type="t" name="presentation_wait_ms" direction="out"/>
      <arg type="b" name="recovering" direction="out"/>
    </method>
  </interface>
</node>`;

interface PresentingBackend {
  get_presentation_wait_us(): number;
}

interface RecoveringBackend {
  is_recovering(): boolean;
}

export class Health {
  private readonly dbus = Gio.DBusExportedObject.wrapJSObject(HEALTH_INTERFACE, this);

  constructor() {
    this.dbus.export(Gio.DBus.session, '/com/lantharos/Kestrel/Health');
  }

  Check(): [number, boolean] {
    const shell = global as unknown as Shell.Global;
    const presentation = shell.backend as unknown as PresentingBackend;
    const graphics = shell.stage.context.get_backend() as unknown as RecoveringBackend;
    return [Math.floor(presentation.get_presentation_wait_us() / 1000), graphics.is_recovering()];
  }

  destroy(): void {
    this.dbus.unexport();
  }
}
