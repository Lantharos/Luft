import os
import shutil
import subprocess
import sys
import tempfile
import time

import gi

gi.require_version("Gio", "2.0")
from gi.repository import Gio, GLib

HERE = os.path.dirname(os.path.abspath(__file__))
GNOME_KEYRING, OO7 = sys.argv[1], sys.argv[2]
LOGIN = "correct horse"


def wait_for_name(name, present=True):
    bus = Gio.bus_get_sync(Gio.BusType.SESSION)
    for _ in range(100):
        owner = bus.call_sync("org.freedesktop.DBus", "/org/freedesktop/DBus", "org.freedesktop.DBus", "NameHasOwner",
                              GLib.Variant("(s)", (name,)), None, Gio.DBusCallFlags.NONE, -1, None).unpack()[0]
        if owner == present:
            return
        time.sleep(0.1)
    raise SystemExit(f"{name} never {'appeared' if present else 'went away'}")


def old_keyring(root, name, command, password, items):
    home = os.path.join(root, name)
    data = os.path.join(home, ".local/share")
    runtime = os.path.join(home, "run")
    for folder in (data, runtime):
        os.makedirs(folder, mode=0o700)
    environment = dict(os.environ, HOME=home, XDG_DATA_HOME=data, XDG_RUNTIME_DIR=runtime)
    daemon = subprocess.Popen(command, stdin=subprocess.PIPE, env=environment, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    daemon.stdin.write(password.encode())
    daemon.stdin.close()
    wait_for_name("org.freedesktop.secrets")
    for label, secret, attributes in items:
        subprocess.run(["secret-tool", "store", "--label", label, *attributes], input=secret.encode(), env=environment, check=True)
    daemon.terminate()
    daemon.wait()
    wait_for_name("org.freedesktop.secrets", present=False)
    return os.path.join(data, "keyrings")


def main():
    root = tempfile.mkdtemp(prefix="luft-keyring-fixtures-")
    try:
        gnome = old_keyring(root, "gnome", [GNOME_KEYRING, "--unlock", "--foreground", "--components=secrets"], LOGIN,
                            [("GitHub", "gh-token", ["service", "github.com", "user", "kristof"]),
                             ("Wi-Fi", "hunter2", ["network", "home"]),
                             ("Parley Safe Storage", "parley-key", ["application", "parley"])])
        oo7 = old_keyring(root, "oo7", [OO7, "--login"], LOGIN,
                          [("Mail", "mail-pass", ["service", "mail.example.org"])])
        work = old_keyring(root, "work", [OO7, "--login"], "work pass",
                           [("VPN", "vpn-pass", ["service", "vpn.work"])])
        shutil.copy(os.path.join(gnome, "login.keyring"), os.path.join(HERE, "gnome-keyring.keyring"))
        shutil.copy(os.path.join(oo7, "v1/login.keyring"), os.path.join(HERE, "oo7-login.keyring"))
        shutil.copy(os.path.join(work, "v1/login.keyring"), os.path.join(HERE, "oo7-work.keyring"))
    finally:
        shutil.rmtree(root, ignore_errors=True)


if __name__ == "__main__":
    main()
