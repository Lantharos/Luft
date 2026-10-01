import json
import os
import sys

import gi

gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib

INTERFACE = """
<node>
  <interface name="com.lantharos.Kestrel.KeyringPrompter">
    <method name="Access">
      <arg type="s" name="handle" direction="in"/>
      <arg type="a{sv}" name="request" direction="in"/>
      <arg type="u" name="response" direction="out"/>
      <arg type="a{sv}" name="results" direction="out"/>
    </method>
    <method name="Password">
      <arg type="s" name="handle" direction="in"/>
      <arg type="a{sv}" name="request" direction="in"/>
      <arg type="h" name="secret" direction="in"/>
      <arg type="u" name="response" direction="out"/>
    </method>
    <method name="Close">
      <arg type="s" name="handle" direction="in"/>
    </method>
  </interface>
</node>
"""

script_path, log_path = sys.argv[1], sys.argv[2]


def script():
    with open(script_path) as handle:
        return json.load(handle)


def log(kind, handle, request):
    with open(log_path, "a") as output:
        output.write(json.dumps({"kind": kind, "handle": handle, "request": request}) + "\n")


def next_password(handle):
    plan = script()
    answers = plan.get("passwords", [])
    if not answers:
        return None
    answer = answers.pop(0)
    with open(script_path, "w") as output:
        json.dump(plan, output)
    return answer


def call(connection, sender, path, interface, method, parameters, invocation):
    if method == "Access":
        handle, request = parameters.unpack()
        log("access", handle, request)
        allowed = script().get("access", "allow") == "allow"
        remember = script().get("remember", True)
        invocation.return_value(GLib.Variant("(ua{sv})", (0 if allowed else 1, {"remember": GLib.Variant("b", remember)})))
    elif method == "Password":
        handle, request, _ = parameters.unpack()
        log("password", handle, request)
        answer = next_password(handle)
        if answer is None:
            invocation.return_value(GLib.Variant("(u)", (1,)))
            return
        descriptor = invocation.get_message().get_unix_fd_list().get(0)
        os.write(descriptor, answer.encode())
        os.close(descriptor)
        invocation.return_value(GLib.Variant("(u)", (0,)))
    else:
        (handle,) = parameters.unpack()
        log("close", handle, {})
        invocation.return_value(None)


bus = Gio.bus_get_sync(Gio.BusType.SESSION)
info = Gio.DBusNodeInfo.new_for_xml(INTERFACE).interfaces[0]
bus.register_object("/com/lantharos/Kestrel/KeyringPrompter", info, call, None, None)
Gio.bus_own_name_on_connection(bus, "com.lantharos.Kestrel", Gio.BusNameOwnerFlags.NONE, None, None)
GLib.MainLoop().run()
