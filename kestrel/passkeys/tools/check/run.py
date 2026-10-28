#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

LUFT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(LUFT / "os/vm"))
from control import Machine, MachineError  # noqa: E402

USER = "luft"
PASSWORD = os.environ.get("VM_PASSWORD", "luft-vm")
FINGER = "/run/luft-vm-fingerprint/finger"
RESULTS = "/tmp/passkey-check.jsonl"
PAGE = "http://localhost:8000/index.html"
BROWSERS = {
    "chromium": "chromium-browser --ozone-platform=wayland --no-first-run --no-default-browser-check "
    "--password-store=basic --user-data-dir=/tmp/chromium-check",
    "firefox": "firefox --no-remote --profile /tmp/firefox-check",
}


class Check:
    def __init__(self, folder: Path, tpm: bool):
        self.folder = folder
        work = folder / "work.qcow2"
        work.unlink(missing_ok=True)
        subprocess.run(["rm", "-rf", str(folder / "tpm")], check=True)
        subprocess.run(
            ["qemu-img", "create", "-q", "-f", "qcow2", "-F", "qcow2", "-b", str(folder / "disk.qcow2"), str(work)],
            check=True,
        )
        environment = dict(os.environ, LUFT_VM=str(folder), DISK=str(work), HEADLESS="1", TPM="2" if tpm else "0")
        self.qemu = subprocess.Popen([str(LUFT / "os/vm/qemu.sh")], env=environment)
        self.machine = Machine(folder, seconds=120)
        self.uid = ""
        try:
            self.machine.enroll(PASSWORD, 120)
        except MachineError:
            pass

    def run(self, command: str, seconds: float = 60) -> str:
        return self.machine.shell(command, seconds)[1]

    def as_user(self, command: str, seconds: float = 60) -> str:
        environment = (
            f"XDG_RUNTIME_DIR=/run/user/{self.uid} WAYLAND_DISPLAY=wayland-0 "
            f"DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/{self.uid}/bus"
        )
        return self.run(f"runuser -u {USER} -- env {environment} {command}", seconds)

    def type(self, text: str):
        self.machine.type(text, pause=0.04)

    def wake(self):
        self.machine.press("ctrl")
        time.sleep(2)

    def screenshot(self, path: Path):
        self.machine.screenshot(path)

    def stop(self):
        try:
            self.machine.qmp("system_powerdown")
            self.qemu.wait(timeout=60)
        except (OSError, subprocess.TimeoutExpired):
            self.machine.qmp("quit")
            self.qemu.wait(timeout=20)


def sign_in(machine: Check):
    machine.run("systemctl is-system-running --wait > /dev/null", 300)
    machine.uid = machine.run(f"id -u {USER}")
    machine.run("until loginctl list-sessions --no-legend | grep -q greeter; do sleep 1; done", 180)
    active = f"loginctl show-user {USER} -p State --value 2>/dev/null | grep -qx active"
    for _ in range(6):
        time.sleep(10)
        machine.wake()
        machine.type(PASSWORD + "\n")
        if machine.run(f"timeout 20 sh -c 'until {active}; do sleep 1; done' && echo signed-in", 30):
            break
    else:
        raise SystemExit(f"{USER} couldn't sign in at the login screen")
    machine.as_user(
        "sh -c 'until busctl --user status com.lantharos.Kestrel.Passkeys >/dev/null 2>&1; do sleep 1; done'", 180
    )
    time.sleep(5)
    unlock = "busctl --user call com.lantharos.Keyring1 /com/lantharos/Keyring1 com.lantharos.Keyring1 Unlock"
    machine.as_user(f"sh -c '{unlock} >/tmp/unlock.log 2>&1 &'")
    time.sleep(4)
    machine.type(PASSWORD + "\n")
    machine.as_user("sh -c 'until grep -q true /tmp/unlock.log; do sleep 0.5; done'", 60)


def report(machine: Check) -> dict:
    return {
        "relay": machine.run("systemctl is-active luft-passkeys-relay.socket"),
        "agent": machine.as_user("systemctl --user is-active luft-passkeys.service"),
        "ready": machine.as_user(
            "busctl --user get-property com.lantharos.Passkeys /com/lantharos/Passkeys1 com.lantharos.Passkeys1 Ready"
        ),
        "protection": machine.as_user(
            "busctl --user get-property com.lantharos.Passkeys /com/lantharos/Passkeys1 com.lantharos.Passkeys1 Protection"
        ),
        "device": machine.run(
            f"for node in /sys/class/hidraw/*; do grep -q 'HID_NAME=Luft Passkeys' $node/device/uevent && "
            "udevadm info -q property /dev/$(basename $node) | grep -E 'ID_SECURITY_TOKEN|ID_FIDO_TOKEN' && "
            "getfacl -p /dev/$(basename $node) | grep {USER}; done"
        ),
        "denials": machine.run("ausearch -m avc -ts boot 2>/dev/null | grep -c denied || true"),
    }


def prompts(machine: Check) -> set[str]:
    tree = machine.as_user("busctl --user tree --list com.lantharos.Kestrel.Passkeys 2>/dev/null")
    return {line for line in tree.splitlines() if "Prompt" in line}


def wait_for_prompt(machine: Check, before: set[str], seconds: float = 90):
    deadline = time.monotonic() + seconds
    while not prompts(machine) - before:
        if time.monotonic() > deadline:
            raise SystemExit("Kestrel's passkey prompt didn't appear")
        time.sleep(0.3)
    time.sleep(3)


def results(machine: Check) -> list[dict]:
    lines = machine.run(f"cat {RESULTS} 2>/dev/null")
    return [json.loads(line) for line in lines.splitlines() if line.startswith("{")]


def ceremony(machine: Check, browser: str, step: str, verify: str, shots: Path | None) -> dict:
    before = len(results(machine))
    shown = prompts(machine)
    pid = machine.as_user(
        f"sh -c '{BROWSERS[browser]} \"{PAGE}?step={step}\" >/tmp/{browser}.log 2>&1 & echo $!'"
    ).splitlines()[-1]
    wait_for_prompt(machine, shown)
    if shots:
        machine.screenshot(shots / f"{browser}-{step}.png")
    if verify == "fingerprint":
        machine.run(f"echo match > {FINGER}; sleep 1; echo away > {FINGER}")
    else:
        machine.type(PASSWORD + "\n")
    if browser == "chromium" and step == "get":
        time.sleep(4)
        if shots:
            machine.screenshot(shots / "chromium-choose.png")
        machine.type("\n")
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        found = results(machine)
        if len(found) > before:
            machine.run(f"kill {pid}; while kill -0 {pid} 2>/dev/null; do sleep 0.2; done", 30)
            return {key: value for key, value in found[-1].items() if key != "publicKey"}
        time.sleep(1)
    if shots:
        machine.screenshot(shots / f"{browser}-{step}-stuck.png")
    machine.run(f"kill {pid}")
    return {"step": step, "ok": False, "error": "no result"}


def main():
    parser = argparse.ArgumentParser(description="Runs real browsers against Luft Passkeys in a VM made by prepare.sh")
    parser.add_argument("--no-tpm", action="store_true")
    parser.add_argument(
        "--password", action="store_true", help="verify with the password instead of the fingerprint reader"
    )
    parser.add_argument("--browsers", default="chromium,firefox")
    parser.add_argument("--shots", type=Path)
    arguments = parser.parse_args()
    folder = Path(os.environ.get("PASSKEYS_VM", LUFT / "kestrel/run/passkeys-vm")).resolve()
    if arguments.shots:
        arguments.shots.mkdir(parents=True, exist_ok=True)
    machine = Check(folder, tpm=not arguments.no_tpm)
    try:
        sign_in(machine)
        if not arguments.password:
            machine.run(f"echo away > {FINGER}")
        machine.as_user(
            "sh -c 'mkdir -p /tmp/firefox-check && cp /usr/share/passkeys-check/firefox-user.js /tmp/firefox-check/user.js'"
        )
        machine.as_user(f"sh -c 'python3 /usr/share/passkeys-check/serve.py {RESULTS} >/tmp/serve.log 2>&1 &'")
        print(json.dumps(report(machine), indent=2))
        verify = "password" if arguments.password else "fingerprint"
        for browser in arguments.browsers.split(","):
            for step in ("create", "get"):
                print(browser, json.dumps(ceremony(machine, browser, step, verify, arguments.shots)), flush=True)
        print(
            machine.as_user(
                "busctl --user call com.lantharos.Passkeys /com/lantharos/Passkeys1 com.lantharos.Passkeys1 List"
            )
        )
        print(machine.as_user("journalctl --user -u luft-passkeys.service -b --no-pager -o cat | tail -20"))
    finally:
        machine.stop()


if __name__ == "__main__":
    main()
