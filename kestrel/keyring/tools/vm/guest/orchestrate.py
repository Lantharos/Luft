#!/usr/bin/python3
import glob
import json
import os
import pwd
import socket
import struct
import subprocess
import time

HERE = os.path.dirname(os.path.abspath(__file__))
STATE = "/var/lib/keyring-test"
PASSWORD = "sign-in words"
person = pwd.getpwnam("person")
result_path = os.path.join(person.pw_dir, "result.json")
tally = {"passed": 0, "failed": 0}


def report(line):
    with open("/dev/kmsg", "w") as kernel_log:
        kernel_log.write(f"<2>keyring-test: {line}\n")


def check(passed, label):
    tally["passed" if passed else "failed"] += 1
    report(f"{'ok' if passed else 'FAILED'}: {label}")


def greetd_socket():
    for _ in range(120):
        for environ in glob.glob("/proc/[0-9]*/environ"):
            try:
                variables = open(environ, "rb").read().split(b"\0")
            except OSError:
                continue
            for variable in variables:
                if variable.startswith(b"GREETD_SOCK="):
                    return variable.split(b"=", 1)[1].decode()
        time.sleep(1)
    status = subprocess.run(["journalctl", "-b", "-u", "greetd", "--no-pager", "-n", "30"], capture_output=True, text=True).stdout
    raise RuntimeError("greetd never started its greeter\n" + status)


def exchange(connection, message):
    payload = json.dumps(message).encode()
    connection.sendall(struct.pack("=I", len(payload)) + payload)
    size = struct.unpack("=I", connection.recv(4, socket.MSG_WAITALL))[0]
    return json.loads(connection.recv(size, socket.MSG_WAITALL))


def login(method, scenario):
    with open(os.path.join(STATE, "scenario.json"), "w") as output:
        json.dump({"name": scenario}, output)
    with open("/run/keyring-test/finger", "w") as finger:
        finger.write("match" if method == "fingerprint" else "none")
    if os.path.exists(result_path):
        os.remove(result_path)
    messages = []
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as connection:
        connection.connect(greetd_socket())
        reply = exchange(connection, {"type": "create_session", "username": "person"})
        while reply["type"] == "auth_message":
            messages.append(reply["auth_message"])
            answer = PASSWORD if reply["auth_message_type"] == "secret" else None
            reply = exchange(connection, {"type": "post_auth_message_response", "response": answer})
        signed_in = reply["type"] == "success"
        check(signed_in, f"{scenario}: signing in with a {method} works")
        if method == "fingerprint":
            check(not any("assword" in message for message in messages), f"{scenario}: no password was asked for")
        if not signed_in:
            return
        exchange(connection, {"type": "start_session", "cmd": [os.path.join(HERE, "probe.py")], "env": []})
    for _ in range(180):
        if os.path.exists(result_path):
            break
        time.sleep(1)
    else:
        check(False, f"{scenario}: the session reported back")
        return
    time.sleep(1)
    for label, passed in json.load(open(result_path)):
        check(passed, f"{scenario}: {label}")
    time.sleep(3)


def extend_secure_boot_state():
    subprocess.run(["tpm2_pcrextend", "7:sha256=" + "01" * 32], check=True, env=dict(os.environ, TPM2TOOLS_TCTI="device:/dev/tpmrm0"))


def denials():
    log = subprocess.run(["journalctl", "-k", "-b", "--no-pager"], capture_output=True, text=True).stdout
    return [line for line in log.splitlines() if "avc:" in line and "denied" in line]


def diagnose():
    for prompts in sorted(glob.glob(os.path.join(person.pw_dir, "prompts-*.log"))):
        for line in open(prompts).read().splitlines()[-6:]:
            report(f"prompt {os.path.basename(prompts)}: {line[:300]}")
    for selector in (["-u", "luft-keyring-unlock"], ["_SYSTEMD_USER_UNIT=luft-keyring.service"], ["-u", "greetd"]):
        log = subprocess.run(["journalctl", "-b", "--no-pager", "-o", "cat", "-n", "25", *selector], capture_output=True, text=True).stdout
        for line in log.splitlines():
            report(f"log {selector[-1]}: {line}")


def main():
    mode = next((word.split("=", 1)[1] for word in open("/proc/cmdline").read().split() if word.startswith("keyring.test=")), "tpm")
    os.makedirs("/run/keyring-test", exist_ok=True)
    os.makedirs(STATE, exist_ok=True)
    with open("/run/keyring-test/finger", "w") as finger:
        finger.write("none")
    os.chmod("/run/keyring-test/finger", 0o666)
    mock = subprocess.Popen(["/usr/bin/python3", os.path.join(HERE, "fprintd.py")])
    time.sleep(1)
    report(f"LUFT-KEYRING-VM START {mode}")
    if mode == "tpm":
        login("password", "first sign-in")
        check(os.path.exists(f"/var/lib/luft-keyring/{person.pw_uid}.seal"), "the security chip holds a seal for the person")
        login("fingerprint", "fingerprint sign-in")
        extend_secure_boot_state()
        login("fingerprint", "startup changed")
        login("fingerprint", "fingerprint after resealing")
        login("password", "choosing a PIN")
        login("fingerprint", "fingerprint with a PIN")
    elif mode == "gone":
        login("password", "chip gone")
        login("fingerprint", "fingerprint without a chip")
    else:
        login("password", "first sign-in without a chip")
        login("fingerprint", "fingerprint without a chip")
    if tally["failed"]:
        diagnose()
    found = denials()
    for line in found:
        report(f"denial: {line}")
    check(not found, "SELinux denied nothing")
    mock.terminate()
    report(f"LUFT-KEYRING-VM DONE passed={tally['passed']} failed={tally['failed']}")
    subprocess.run(["systemctl", "poweroff"])


try:
    main()
except Exception as error:
    report(f"FAILED: the test stopped: {error}")
    report(f"LUFT-KEYRING-VM DONE passed={tally['passed']} failed={tally['failed'] + 1}")
    subprocess.run(["systemctl", "poweroff"])
