#!/usr/bin/env python3
import argparse
import json
import os
import time
from pathlib import Path

from machine import Machine

PASSWORD = os.environ.get("VM_PASSWORD", "sushi-vm")
RESULTS = "/tmp/passkey-check.jsonl"
PAGE = "http://localhost:8000/index.html"
BROWSERS = {
    "chromium": "chromium-browser --ozone-platform=wayland --no-first-run --no-default-browser-check "
    "--password-store=basic --user-data-dir=/tmp/chromium-check",
    "firefox": "firefox --no-remote --profile /tmp/firefox-check",
}


def sign_in(machine: Machine):
    machine.sign_in_on_console(PASSWORD)
    machine.run("until loginctl list-sessions --no-legend | grep -q greeter; do sleep 1; done", 180)
    time.sleep(10)
    machine.wake()
    machine.type(PASSWORD + "\n")
    machine.run("until loginctl show-user sushi -p State --value 2>/dev/null | grep -qx active; do sleep 1; done", 120)
    machine.as_user(
        "sh -c 'until busctl --user status com.lantharos.Kestrel.Passkeys >/dev/null 2>&1; do sleep 1; done'", 180
    )
    time.sleep(5)
    unlock = "busctl --user call com.lantharos.Keyring1 /com/lantharos/Keyring1 com.lantharos.Keyring1 Unlock"
    machine.as_user(f"sh -c '{unlock} >/tmp/unlock.log 2>&1 &'")
    time.sleep(4)
    machine.type(PASSWORD + "\n")
    machine.as_user("sh -c 'until grep -q true /tmp/unlock.log; do sleep 0.5; done'", 60)


def report(machine: Machine) -> dict:
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
            "for node in /sys/class/hidraw/*; do grep -q 'HID_NAME=Luft Passkeys' $node/device/uevent && "
            "udevadm info -q property /dev/$(basename $node) | grep -E 'ID_SECURITY_TOKEN|ID_FIDO_TOKEN' && "
            "getfacl -p /dev/$(basename $node) | grep sushi; done"
        ),
        "denials": machine.run("ausearch -m avc -ts boot 2>/dev/null | grep -c denied || true"),
    }


def wait_for_prompt(machine: Machine, seconds: float = 90):
    machine.as_user(
        "sh -c 'until busctl --user tree com.lantharos.Kestrel.Passkeys 2>/dev/null | grep -q Prompt; do sleep 0.3; done'",
        seconds,
    )
    time.sleep(1.2)


def results(machine: Machine) -> list[dict]:
    lines = machine.run(f"cat {RESULTS} 2>/dev/null")
    return [json.loads(line) for line in lines.splitlines() if line.startswith("{")]


def ceremony(machine: Machine, browser: str, step: str, verify: str, shots: Path | None) -> dict:
    before = len(results(machine))
    pid = machine.as_user(
        f"sh -c '{BROWSERS[browser]} \"{PAGE}?step={step}\" >/tmp/{browser}.log 2>&1 & echo $!'"
    ).splitlines()[-1]
    wait_for_prompt(machine)
    if shots:
        machine.screenshot(shots / f"{browser}-{step}.png")
    if verify == "fingerprint":
        machine.run("echo verify-match > /run/fprintd-check/touch")
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
    parser = argparse.ArgumentParser(description="Runs real browsers against Luft Passkeys in the Sushi VM")
    parser.add_argument("--no-tpm", action="store_true")
    parser.add_argument(
        "--password", action="store_true", help="verify with the password instead of the fingerprint reader"
    )
    parser.add_argument("--browsers", default="chromium,firefox")
    parser.add_argument("--shots", type=Path)
    arguments = parser.parse_args()
    folder = Path(os.environ["SUSHI_VM"])
    if arguments.shots:
        arguments.shots.mkdir(parents=True, exist_ok=True)
    machine = Machine(folder, tpm=not arguments.no_tpm)
    try:
        sign_in(machine)
        if arguments.password:
            machine.run("systemctl stop fprintd-check.service")
        machine.as_user(
            "sh -c 'mkdir -p /tmp/firefox-check && cp /usr/local/share/passkeys-check/firefox-user.js /tmp/firefox-check/user.js'"
        )
        machine.as_user(f"sh -c 'python3 /usr/local/share/passkeys-check/serve.py {RESULTS} >/tmp/serve.log 2>&1 &'")
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
