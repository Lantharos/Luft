#!/usr/bin/env python3
from pathlib import Path

from gi.repository import Gio, GLib

TOUCH = Path("/run/fprintd-check/touch")
DEVICE_PATH = "/net/reactivated/Fprint/Device/0"
NODE = """<node>
  <interface name="net.reactivated.Fprint.Manager">
    <method name="GetDefaultDevice"><arg type="o" direction="out"/></method>
    <method name="GetDevices"><arg type="ao" direction="out"/></method>
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
    <property name="scan-type" type="s" access="read"/>
    <property name="num-enroll-stages" type="i" access="read"/>
    <property name="finger-present" type="b" access="read"/>
    <property name="finger-needed" type="b" access="read"/>
  </interface>
</node>"""

info = Gio.DBusNodeInfo.new_for_xml(NODE)
verifying = {"sender": None}


def call(connection, sender, path, interface, method, parameters, invocation):
    if method == "GetDevices":
        invocation.return_value(GLib.Variant("(ao)", ([DEVICE_PATH],)))
    elif method == "GetDefaultDevice":
        invocation.return_value(GLib.Variant("(o)", (DEVICE_PATH,)))
    elif method == "ListEnrolledFingers":
        invocation.return_value(GLib.Variant("(as)", (["right-index-finger"],)))
    elif method == "VerifyStart":
        verifying["sender"] = sender
        invocation.return_value(None)
        connection.emit_signal(sender, DEVICE_PATH, "net.reactivated.Fprint.Device", "VerifyFingerSelected",
                               GLib.Variant("(s)", ("any",)))
    else:
        if method in ("VerifyStop", "Release"):
            verifying["sender"] = None
        invocation.return_value(None)


PROPERTIES = {
    "name": GLib.Variant("s", "Stand-in reader"),
    "scan-type": GLib.Variant("s", "press"),
    "num-enroll-stages": GLib.Variant("i", 5),
    "finger-present": GLib.Variant("b", False),
    "finger-needed": GLib.Variant("b", True),
}


def get_property(connection, sender, path, interface, name):
    return PROPERTIES[name]


def poll(connection):
    if TOUCH.exists() and verifying["sender"]:
        result = TOUCH.read_text().strip() or "verify-match"
        TOUCH.unlink()
        connection.emit_signal(verifying["sender"], DEVICE_PATH, "net.reactivated.Fprint.Device", "VerifyStatus",
                               GLib.Variant("(sb)", (result, True)))
    return True


def acquired(connection, _name):
    connection.register_object("/net/reactivated/Fprint/Manager", info.interfaces[0], call)
    connection.register_object(DEVICE_PATH, info.interfaces[1], call, get_property)
    GLib.timeout_add(150, poll, connection)


Gio.bus_own_name(Gio.BusType.SYSTEM, "net.reactivated.Fprint", Gio.BusNameOwnerFlags.NONE, acquired, None, None)
GLib.MainLoop().run()
