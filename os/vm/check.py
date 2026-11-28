#!/usr/bin/env python3
import argparse
import os
import shutil
import subprocess
import sys
import time
from collections.abc import Callable
from pathlib import Path

from control import DEFAULT_VM, PASSWORD, Machine, MachineError
from memory import memory

HERE = Path(__file__).resolve().parent
USER = os.environ.get("VM_USER", "luft")
GREETER = "pgrep -u greetd -x kestrel"
SESSION_UNITS = "kestrel-session.target kestrel.service kestrel-settings.service"
INCIDENTS = "/var/lib/kestrel-watchdog/incidents"
SETTINGS = "luft-vm-settings"
SETTINGS_PROGRAM = "/usr/lib/sabine/com.lantharos.settings/settings"
LOADER_INFO = "/sys/firmware/efi/efivars/LoaderInfo-4a67b082-0a4c-41cf-b6c7-440b29bb8c4f"
SETTLE = 15


class Check:
    def __init__(self, vm: Path, out: Path, minutes: int):
        self.vm = vm
        self.out = out
        self.minutes = minutes
        self.qemu: subprocess.Popen | None = None
        self.machine: Machine | None = None
        self.shots = 0
        out.mkdir(parents=True, exist_ok=True)

    def log(self, message: str):
        print(f"[{time.strftime('%H:%M:%S')}] {message}", flush=True)

    def start(self, label: str, drives: str = ""):
        environment = os.environ | {"LUFT_VM": str(self.vm), "SECURE_BOOT": "1", "HEADLESS": "1", "DRIVES": drives,
                                    "SERIAL": str(self.out / f"serial-{label}.log"), "TIMEOUT": str(self.minutes * 60)}
        self.qemu = subprocess.Popen([str(HERE / "qemu.sh")], env=environment)
        self.machine = Machine(self.vm, seconds=30)
        self.log(f"started the VM ({label})")

    def stop(self):
        if self.qemu and self.qemu.poll() is None:
            try:
                self.machine.qmp("quit")
            except (MachineError, OSError):
                self.qemu.terminate()
            self.qemu.wait(30)
        self.qemu = self.machine = None

    def wake(self):
        self.machine.press("ctrl")
        time.sleep(2)

    def screenshot(self, name: str):
        self.shots += 1
        self.machine.screenshot(self.out / f"{self.shots:02}-{name}.png")

    def shell(self, command: str, seconds: float = 60) -> tuple[int, str]:
        return self.machine.shell(command, seconds)

    def succeeds(self, command: str) -> bool:
        try:
            return self.shell(command)[0] == 0
        except MachineError:
            return False

    def output(self, command: str, seconds: float = 60) -> str:
        status, text = self.shell(command, seconds)
        if status != 0:
            raise MachineError(f"{command} failed with {status}: {text}")
        return text.strip()

    def wait(self, what: str, ready: Callable[[], bool], seconds: float, every: float = 5):
        self.log(f"waiting until {what}")
        deadline = time.monotonic() + seconds
        while not ready():
            if time.monotonic() > deadline:
                raise MachineError(f"{what} didn't happen within {seconds:.0f} seconds")
            if self.qemu.poll() is not None:
                raise MachineError(f"the VM stopped while waiting until {what}")
            time.sleep(every)
        self.log(f"{what}")

    def boot_id(self) -> str:
        return self.output("cat /proc/sys/kernel/random/boot_id")

    def restarted(self, previous: str) -> bool:
        try:
            return self.boot_id() != previous
        except MachineError:
            return False

    def restart(self, how: Callable[[], object]):
        previous = self.boot_id()
        how()
        self.wait("the VM starts again", lambda: self.restarted(previous), 600)

    def steady(self, what: str, command: str):
        first = self.output(command)
        time.sleep(SETTLE)
        if self.output(command) != first:
            raise MachineError(f"{what} restarted within {SETTLE} seconds")

    def enroll_key(self):
        self.machine.enroll(PASSWORD, 120)
        self.log("added Luft's key on shim's blue screen")

    def unlock_disk(self, passphrase: str):
        self.log("typing the disk's passphrase until Luft starts")
        deadline = time.monotonic() + 600
        while not self.succeeds("true"):
            if time.monotonic() > deadline:
                raise MachineError("Luft didn't start after its passphrase was typed")
            self.machine.type(passphrase + "\n")
        self.log("the disk is unlocked")

    def secure_boot(self):
        if "SecureBoot enabled" not in self.output("mokutil --sb-state"):
            raise MachineError("Secure Boot is off")
        if "SushiBoot" not in self.output(f"tr -d '\\0' < {LOADER_INFO}"):
            raise MachineError("Luft didn't start through SushiBoot")
        self.log("Secure Boot is on and SushiBoot started Luft")

    def greeter_up(self) -> bool:
        if self.succeeds("systemctl is-failed --quiet greetd"):
            raise MachineError("greetd failed")
        return self.succeeds(f"systemctl is-active greetd && {GREETER}")

    def wait_for_greeter(self, seconds: float = 600):
        self.wait("the login screen is up", self.greeter_up, seconds)
        self.steady("the login screen", GREETER)

    def sign_in(self):
        self.wake()
        self.screenshot("login-screen")
        self.machine.type(PASSWORD + "\n")
        self.log(f"typed {USER}'s password")
        states = f"systemctl --user --machine={USER}@ is-active {SESSION_UNITS}"
        self.wait("the desktop is up", lambda: self.succeeds(f'test "$({states} | sort -u)" = active'), 300)
        self.steady("Kestrel", f"systemctl --user --machine={USER}@ show --property=MainPID --value kestrel.service")
        draft = f"grep -q com.lantharos.draft ~{USER}/.local/state/luft/preinstalled"
        self.wait("the preinstalled apps are in", lambda: self.succeeds(draft), 120)
        if self.output(f"ls -A {INCIDENTS} 2>/dev/null | wc -l") != "0":
            raise MachineError("the graphics watchdog recorded an incident")
        self.wake()
        self.screenshot("desktop")
        self.log("the desktop works and the watchdog saw no problems")

    def open_settings(self):
        self.output(f"systemd-run --user --machine={USER}@ --unit={SETTINGS} --setenv=SABINE_TRACE=1 settings")
        painted = f"journalctl --no-pager -o cat _SYSTEMD_USER_UNIT={SETTINGS}.service | grep -q browser.first_paint"
        self.wait("Settings shows its first frame", lambda: self.succeeds(painted), 120)
        self.wake()
        self.screenshot("settings")

    def collect(self):
        for name, command in (
            ("journal", "journalctl -b --no-pager -o short-monotonic"),
            ("failed", f"systemctl --failed --no-pager; systemctl --user --machine={USER}@ --failed --no-pager"),
            ("status", "bootc status; ls -l /boot/loader/entries"),
        ):
            try:
                (self.out / f"{name}.txt").write_text(self.shell(command, 120)[1])
            except MachineError as error:
                self.log(f"couldn't save {name}: {error}")

    def failed(self, error: Exception):
        self.log(f"FAILED: {error}")
        if self.machine:
            try:
                self.screenshot("failure")
            except (MachineError, OSError):
                pass
            self.collect()


def session(check: Check, _: argparse.Namespace):
    check.start("first")
    check.enroll_key()
    check.wait_for_greeter()
    check.secure_boot()
    check.sign_in()
    check.open_settings()
    check.collect()


PACKAGES = "com.lantharos.Packages1 /com/lantharos/Packages1 com.lantharos.Packages1"
REFUSALS = "Refused a caller|Refused to count|Couldn't tell USB protection"


def as_user(command: str) -> str:
    return f"systemd-run --user --machine={USER}@ --wait --pipe --quiet {command}"


def refusals(check: Check, since: str) -> str:
    return check.shell(f"journalctl --no-pager -o cat --since='{since}' | grep -E \"{REFUSALS}\"")[1].strip()


def install(check: Check, package: str):
    check.output(as_user(f"busctl --system --timeout=1800 call {PACKAGES} Install as 1 {package}"), 1800)


def runs_from_before(check: Check, pid: str, path: str) -> bool:
    return check.output(f"stat -L -c %d:%i /proc/{pid}/exe") != check.output(f"stat -c %d:%i {path}")


def packages(check: Check, _: argparse.Namespace):
    check.start("first")
    check.enroll_key()
    check.wait_for_greeter()
    check.sign_in()
    started = check.output("date '+%Y-%m-%d %H:%M:%S'")
    check.wait("the network is up", lambda: check.succeeds("nm-online --quiet --timeout=5"), 300)
    install(check, "htop")
    check.open_settings()
    install(check, "figlet")
    kestrel = check.output(f"pgrep -u {USER} -x kestrel")
    settings = check.output(f"pgrep -u {USER} -o -f {SETTINGS_PROGRAM}")
    if not (runs_from_before(check, kestrel, "/usr/bin/kestrel") and runs_from_before(check, settings, SETTINGS_PROGRAM)):
        raise MachineError("Kestrel or Settings runs from the /usr now mounted, so the merges changed nothing to check")
    check.log(f"Kestrel and Settings run from earlier /usr mounts: {check.output(f'readlink /proc/{settings}/exe')}")
    check.output(as_user("settings kestrel-settings:accounts"))
    time.sleep(SETTLE)
    check.wake()
    check.screenshot("online-accounts")
    check.output("loginctl lock-sessions")
    time.sleep(SETTLE)
    check.wake()
    check.machine.type(PASSWORD + "\n")
    time.sleep(SETTLE)
    check.screenshot("unlocked")
    if found := refusals(check, started):
        raise MachineError(f"a service turned away a program that started before a merge: {found}")
    check.log("Accounts answered Settings and USB protection took Kestrel's unlock after the merges")
    check.collect()


TRUST = "com.lantharos.Trust1 /com/lantharos/Trust1 com.lantharos.Trust1"
TRUST_DISK = f"busctl get-property {TRUST} Disk"


def encryption(check: Check, _: argparse.Namespace):
    check.start("installed")
    check.enroll_key()
    check.wait_for_greeter()
    check.secure_boot()
    if check.succeeds("lsblk -nro FSTYPE | grep -qx crypto_LUKS"):
        raise MachineError("Luft was installed encrypted, so there's nothing for the policy to turn on")
    check.wait("trustd asks for encryption by itself, as the policy requires",
               lambda: '"after-restart"' in check.output(TRUST_DISK), 300)
    if not check.succeeds(f"busctl call {TRUST} CancelSystemDiskEncryption 2>&1 | grep -q 'organization manages'"):
        raise MachineError("calling off encryption the policy requires wasn't refused as managed")
    check.log("calling encryption off is refused, since the policy requires it")
    check.restart(lambda: check.output("systemd-run --on-active=1 systemctl reboot"))
    check.wait_for_greeter()
    check.wait("Luft's partition is encrypted, unlocked by the TPM without anyone typing",
               lambda: check.succeeds("lsblk -nro FSTYPE | grep -qx crypto_LUKS"), 600)


def booted_image(check: Check) -> str:
    return check.output("bootc status --format=json | jq -r .status.booted.image.image.image")


def switch(check: Check, drive: str):
    check.output(f"mkdir -p /run/next && mount -o ro LABEL={drive} /run/next")
    check.output(f"bootc switch --transport oci-archive /run/next/{drive}.ociarchive")
    check.log(f"switched to {drive}, restarting")
    check.restart(lambda: check.output("systemd-run --on-active=1 systemctl reboot"))


def boot_entries(check: Check) -> str:
    return check.output("ls /boot/loader/entries")


def rollback(check: Check, arguments: argparse.Namespace):
    subprocess.run([str(HERE / "updates.sh")], env=os.environ | {"LUFT_VM": str(check.vm)}, check=True)
    check.start("installed", " ".join(f"{check.vm / name}.img:ro" for name in ("update", "broken")))
    check.enroll_key()
    check.wait_for_greeter()
    check.secure_boot()
    switch(check, "update")
    check.wait_for_greeter()
    check.wait("the update is marked as good", lambda: "+" not in boot_entries(check) and
               check.succeeds("systemctl is-active boot-complete.target systemd-bless-boot.service"), 120)
    good = booted_image(check)
    check.log(f"the update started and counts as good: {boot_entries(check)}")
    switch(check, "broken")
    broken = "bootc status --format=json | jq -e '.status.booted.image.image.image | test(\"broken\")'"
    for attempt in range(1, 4):
        if not check.succeeds(broken):
            raise MachineError(f"try {attempt} didn't start the broken version")
        check.wait(f"try {attempt} gives up on the login screen",
                   lambda: check.succeeds("systemctl is-failed --quiet greetd"), arguments.broken_seconds, every=2)
        check.log(f"try {attempt}: no login screen, restarting: {boot_entries(check)}")
        check.restart(lambda: check.machine.qmp("system_reset"))
    check.wait_for_greeter()
    if (booted := booted_image(check)) != good:
        raise MachineError(f"after three failed tries the computer started {booted}, not {good}")
    if not check.succeeds("bootc status --format=json | jq -e '.status.rollbackQueued | not'"):
        raise MachineError("the version that worked isn't the default again")
    check.log("went back to the version that worked and made it the default")
    check.collect()


def main():
    parser = argparse.ArgumentParser(
        description="Check an installed Luft in a VM from os/vm/disk.sh, with Secure Boot on")
    parser.add_argument("--vm", type=Path, default=Path(os.environ.get("LUFT_VM", DEFAULT_VM)))
    parser.add_argument("--out", type=Path, default=None, help="where screenshots and logs go (default VM/check)")
    parser.add_argument("--minutes", type=int, default=40, help="switch the VM off after this long")
    scenarios = parser.add_subparsers(dest="scenario", required=True)
    scenarios.add_parser(
        "session", help="add Luft's key, wait for the login screen, sign in, check the desktop and open Settings")
    scenarios.add_parser(
        "packages", help="sign in, open Settings, install a system package, and check that Settings and Kestrel are "
                         "still recognised as Luft's own programs")
    scenarios.add_parser(
        "encryption", help="add Luft's key, and check that a policy requiring encryption has trustd encrypt Luft's "
                           "partition from the next restart")
    scenarios.add_parser(
        "memory", help="on a VM installed with VM_ENCRYPTED=1 and started with little memory, check swap growing and "
                       "shrinking, the app in front keeping its memory and a growing app being the one closed")
    going_back = scenarios.add_parser(
        "rollback", help="update, then update to a version that never reaches the login screen, and check that the "
                         "computer goes back after three tries")
    going_back.add_argument("--broken-seconds", type=float, default=180,
                            help="how long a start of the broken version may take to give up on its login screen")
    arguments = parser.parse_args()
    vm = arguments.vm.resolve()
    out = (arguments.out or vm / "check").resolve()
    shutil.rmtree(out, ignore_errors=True)
    check = Check(vm, out, arguments.minutes)
    try:
        {"session": session, "packages": packages, "encryption": encryption, "rollback": rollback,
         "memory": lambda check, _: memory(check, USER)}[arguments.scenario](check, arguments)
    except (MachineError, OSError) as error:
        check.failed(error)
        check.stop()
        sys.exit(f"The check failed; screenshots and logs are in {out}")
    check.stop()
    check.log(f"passed; screenshots and logs are in {out}")


if __name__ == "__main__":
    main()
