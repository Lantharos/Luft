#!/usr/bin/env python3
from pathlib import Path

from gi.repository import Gio, GLib

FINGER = Path("/run/luft-vm-fingerprint/finger")
MANAGER = "/net/reactivated/Fprint/Manager"
DEVICE = "/net/reactivated/Fprint/Device/0"
NODE = """<node>
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
</node>"""
PROPERTIES = {
    "name": GLib.Variant("s", "VM reader"),
    "num-enroll-stages": GLib.Variant("i", 5),
    "scan-type": GLib.Variant("s", "press"),
    "finger-present": GLib.Variant("b", False),
    "finger-needed": GLib.Variant("b", True),
}
RESULTS = {"match": "verify-match", "no-match": "verify-no-match"}
verifying = {"sender": None}


def finger() -> str:
    return FINGER.read_text().strip()


def call(connection, sender, path, interface, method, parameters, invocation):
    if method == "GetDevices":
        invocation.return_value(GLib.Variant("(ao)", ([DEVICE],)))
    elif method == "GetDefaultDevice":
        invocation.return_value(GLib.Variant("(o)", (DEVICE,)))
    elif method == "ListEnrolledFingers" and finger() == "none":
        invocation.return_dbus_error("net.reactivated.Fprint.Error.NoEnrolledPrints", "No fingerprints enrolled")
    elif method == "ListEnrolledFingers":
        invocation.return_value(GLib.Variant("(as)", (["right-index-finger"],)))
    elif method == "VerifyStart":
        verifying["sender"] = sender
        invocation.return_value(None)
        connection.emit_signal(None, DEVICE, interface, "VerifyFingerSelected", GLib.Variant("(s)", ("any",)))
    else:
        if method in ("VerifyStop", "Release"):
            verifying["sender"] = None
        invocation.return_value(None)


def get_property(connection, sender, path, interface, name):
    return PROPERTIES[name]


def touch(connection) -> bool:
    if verifying["sender"] and (result := RESULTS.get(finger())):
        status = GLib.Variant("(sb)", (result, True))
        connection.emit_signal(None, DEVICE, "net.reactivated.Fprint.Device", "VerifyStatus", status)
        verifying["sender"] = None
    return True


def acquired(connection, _name):
    node = Gio.DBusNodeInfo.new_for_xml(NODE)
    connection.register_object(MANAGER, node.interfaces[0], call)
    connection.register_object(DEVICE, node.interfaces[1], call, get_property)
    GLib.timeout_add(150, touch, connection)


FINGER.write_text("none\n")
FINGER.chmod(0o666)
Gio.bus_own_name(Gio.BusType.SYSTEM, "net.reactivated.Fprint", Gio.BusNameOwnerFlags.NONE, acquired, None, None)
GLib.MainLoop().run()
