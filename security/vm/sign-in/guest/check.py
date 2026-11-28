#!/usr/bin/python3
import glob
import json
import os
import pwd
import socket
import struct
import subprocess
import time

STATE = "/var/lib/sign-in-check"
PASSWORD = "luft-vm"
KEY_PIN = "123456"
CARD_PIN = "12345678"
METHOD_QUESTION = "Sign in with (fingerprint/security-key/smart-card/recovery-key/password): "
ANSWERS = {"Security key PIN: ": KEY_PIN, "Smart card PIN: ": CARD_PIN, "Password: ": PASSWORD}
READER = "08e6:4433"
person = pwd.getpwnam("luft")
result_path = os.path.join(person.pw_dir, "result.json")
tally = {"passed": 0, "failed": 0}


def report(line):
    with open("/dev/kmsg", "w") as kernel_log:
        kernel_log.write(f"<2>sign-in-check: {line}\n")


def check(passed, label):
    tally["passed" if passed else "failed"] += 1
    report(f"{'ok' if passed else 'FAILED'}: {label}")


def greetd_socket():
    for _ in range(120):
        for environ in glob.glob("/proc/[0-9]*/environ"):
            try:
                with open(environ, "rb") as file:
                    variables = file.read().split(b"\0")
            except OSError:
                continue
            for variable in variables:
                if variable.startswith(b"GREETD_SOCK="):
                    return variable.split(b"=", 1)[1].decode()
        time.sleep(1)
    raise RuntimeError("greetd never started its greeter")


def exchange(connection, message):
    payload = json.dumps(message).encode()
    connection.sendall(struct.pack("=I", len(payload)) + payload)
    size = struct.unpack("=I", connection.recv(4, socket.MSG_WAITALL))[0]
    return json.loads(connection.recv(size, socket.MSG_WAITALL))


def sign_in(way, scenario, pins=None):
    """Signs in through greetd as the login screen does, and runs the probe in the session."""
    answers = ANSWERS | (pins or {})
    with open(os.path.join(STATE, "scenario.json"), "w") as output:
        json.dump({"name": scenario}, output)
    if os.path.exists(result_path):
        os.remove(result_path)
    messages = []
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as connection:
        connection.connect(greetd_socket())
        reply = exchange(connection, {"type": "create_session", "username": person.pw_name})
        while reply["type"] == "auth_message":
            messages.append(reply["auth_message"])
            text = reply["auth_message"]
            answer = way if text == METHOD_QUESTION else answers.get(text)
            reply = exchange(connection, {"type": "post_auth_message_response", "response": answer})
        if reply["type"] != "success":
            exchange(connection, {"type": "cancel_session"})
            return False, messages
        exchange(connection, {"type": "start_session", "cmd": ["/usr/libexec/sign-in-check/session.py"], "env": []})
    removal = os.path.join(person.pw_dir, "remove-card")
    for _ in range(180):
        if os.path.exists(result_path):
            break
        if os.path.exists(removal):
            os.remove(removal)
            report("remove card")
        time.sleep(1)
    else:
        check(False, f"{scenario}: the session reported back")
        return True, messages
    with open(result_path) as result:
        for label, passed in json.load(result):
            check(passed, f"{scenario}: {label}")
    signed_out()
    return True, messages


def loginctl(*arguments):
    return subprocess.run(["loginctl", *arguments, "--value"], capture_output=True, text=True, check=False).stdout.strip()


def signed_out():
    """Waits until the login screen's own session is the active one again, so the computer counts as locked."""
    for _ in range(240):
        active = loginctl("show-seat", "seat0", "--property=ActiveSession")
        gone = subprocess.run(["loginctl", "show-user", "luft"], capture_output=True, check=False).returncode != 0
        if gone and active and loginctl("show-session", active, "--property=Class") == "greeter":
            return
        time.sleep(0.5)


def read(path):
    try:
        with open(path) as file:
            return file.read().strip()
    except OSError:
        return None


def reader():
    """The emulated reader's USB device and its smart card part, as (devnum, part)."""
    for device in glob.glob("/sys/bus/usb/devices/*"):
        if f"{read(f'{device}/idVendor')}:{read(f'{device}/idProduct')}" != READER:
            continue
        parts = [part for part in glob.glob(f"{device}/*:*") if read(f"{part}/bInterfaceClass") == "0b"]
        return read(f"{device}/devnum"), parts[0] if parts else None
    return None, None


def replug_reader():
    """Plugs the reader in again while nobody is signed in, and says whether its card part connected."""
    before, _ = reader()
    report("replug reader")
    for _ in range(150):
        time.sleep(0.2)
        number, part = reader()
        if number and number != before and part:
            break
    time.sleep(3)
    _, part = reader()
    return part is not None and read(f"{part}/authorized") == "1"


def denials():
    log = subprocess.run(["journalctl", "-k", "-b", "--no-pager"], capture_output=True, text=True, check=False).stdout
    return [line for line in log.splitlines() if "avc:" in line and "denied" in line]


def diagnose():
    for unit in ("luft-sign-in", "greetd", "pcscd", "luft-keyring-unlock", "portguard", "sign-in-authenticator"):
        log = subprocess.run(["journalctl", "-b", "--no-pager", "-o", "cat", "-n", "40", "-u", unit],
                             capture_output=True, text=True, check=False).stdout
        for line in log.splitlines():
            report(f"log {unit}: {line}")
    log = subprocess.run(["journalctl", "-b", "--no-pager", "-o", "cat", "-n", "30", "_SYSTEMD_USER_UNIT=luft-keyring.service"],
                         capture_output=True, text=True, check=False).stdout
    for line in log.splitlines():
        report(f"log luft-keyring: {line}")
    for command in (["cat", "/var/lib/luft-sign-in/devices"], ["ls", "-l", "/sys/bus/usb/devices"], ["opensc-tool", "--list-readers"], ["pkcs11-tool", "--module", "/usr/lib64/p11-kit-proxy.so", "--list-token-slots"]):
        found = subprocess.run(command, capture_output=True, text=True, check=False)
        for line in (found.stdout + found.stderr).splitlines():
            report(f"{command[0]}: {line}")


def main():
    os.makedirs(STATE, exist_ok=True)
    report("START")
    check(not replug_reader(), "a card reader nobody enrolled waits while nobody is signed in")
    signed_in, _ = sign_in("password", "enrolling")
    check(signed_in, "the password signs in before anything else is enrolled")
    with open("/var/lib/luft-sign-in/devices") as devices:
        listed = devices.read()
    check(f"\t{READER}\t" in listed and "card-reader" in listed, "USB protection learns the enrolled card reader")
    check(replug_reader(), "the enrolled card reader connects while nobody is signed in")
    signed_in, messages = sign_in("password", "password off")
    check(not signed_in and "Password sign-in is turned off" in messages, "the password no longer signs in once turned off")
    signed_in, messages = sign_in("security-key", "wrong key PIN", {"Security key PIN: ": "000000"})
    check(not signed_in and "Wrong PIN" in messages, "a wrong security key PIN is refused")
    signed_in, messages = sign_in("security-key", "security key")
    check(signed_in and "Touch your security key" in messages, "the security key signs in after its PIN and a touch")
    signed_in, _ = sign_in("smart-card", "smart card")
    check(signed_in, "the smart card signs in after its PIN")
    subprocess.run(["/usr/libexec/luft-sign-in", "allow-password", "luft"], check=True)
    signed_in, _ = sign_in("password", "password again")
    check(signed_in, "allowing the password again from a root shell brings it back")
    if tally["failed"]:
        diagnose()
    found = denials()
    for line in found:
        report(f"denial: {line}")
    check(not found, "SELinux denied nothing")
    report(f"DONE passed={tally['passed']} failed={tally['failed']}")
    subprocess.run(["systemctl", "poweroff"], check=False)


try:
    main()
except Exception as error:  # noqa: BLE001
    report(f"FAILED: the check stopped: {error}")
    diagnose()
    report(f"DONE passed={tally['passed']} failed={tally['failed'] + 1}")
    subprocess.run(["systemctl", "poweroff"], check=False)
