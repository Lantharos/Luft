import gi

gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib

CONTROL = "/run/keyring-test/finger"
MANAGER = "/net/reactivated/Fprint/Manager"
DEVICE = "/net/reactivated/Fprint/Device/0"
XML = """
<node>
  <interface name="net.reactivated.Fprint.Manager">
    <method name="GetDevices"><arg type="ao" direction="out"/></method>
    <method name="GetDefaultDevice"><arg type="o" direction="out"/></method>
  </interface>
  <interface name="net.reactivated.Fprint.Device">
    <method name="ListEnrolledFingers"><arg type="s" direction="in"/><arg type="as" direction="out"/></method>
    <method name="Claim"><arg type="s" direction="in"/></method>
    <method name="Release"/>
    <method name="VerifyStart"><arg type="s" direction="in"/></method>
    <method name="VerifyStop"/>
    <signal name="VerifyStatus"><arg type="s"/><arg type="b"/></signal>
    <signal name="VerifyFingerSelected"><arg type="s"/></signal>
    <property name="name" type="s" access="read"/>
    <property name="num-enroll-stages" type="i" access="read"/>
    <property name="scan-type" type="s" access="read"/>
    <property name="finger-present" type="b" access="read"/>
    <property name="finger-needed" type="b" access="read"/>
  </interface>
</node>
"""
PROPERTIES = {"name": GLib.Variant("s", "Test reader"), "num-enroll-stages": GLib.Variant("i", 5),
              "scan-type": GLib.Variant("s", "press"), "finger-present": GLib.Variant("b", False),
              "finger-needed": GLib.Variant("b", False)}


def finger():
    try:
        with open(CONTROL) as control:
            return control.read().strip()
    except OSError:
        return "match"


def call(connection, sender, path, interface, method, parameters, invocation):
    if method == "GetDevices":
        invocation.return_value(GLib.Variant("(ao)", ([DEVICE],)))
    elif method == "GetDefaultDevice":
        invocation.return_value(GLib.Variant("(o)", (DEVICE,)))
    elif method == "ListEnrolledFingers":
        if finger() == "none":
            invocation.return_dbus_error("net.reactivated.Fprint.Error.NoEnrolledPrints", "No fingerprints enrolled")
        else:
            invocation.return_value(GLib.Variant("(as)", (["right-index-finger"],)))
    elif method == "VerifyStart":
        invocation.return_value(None)
        result = "verify-match" if finger() == "match" else "verify-no-match"
        def report():
            connection.emit_signal(sender, DEVICE, "net.reactivated.Fprint.Device", "VerifyFingerSelected", GLib.Variant("(s)", ("any",)))
            connection.emit_signal(sender, DEVICE, "net.reactivated.Fprint.Device", "VerifyStatus", GLib.Variant("(sb)", (result, True)))
            return False
        GLib.timeout_add(300, report)
    else:
        invocation.return_value(None)


def get_property(connection, sender, path, interface, name):
    return PROPERTIES[name]


bus = Gio.bus_get_sync(Gio.BusType.SYSTEM)
node = Gio.DBusNodeInfo.new_for_xml(XML)
bus.register_object(MANAGER, node.interfaces[0], call, None, None)
bus.register_object(DEVICE, node.interfaces[1], call, get_property, None)
Gio.bus_own_name_on_connection(bus, "net.reactivated.Fprint", Gio.BusNameOwnerFlags.NONE, None, None)
GLib.MainLoop().run()
