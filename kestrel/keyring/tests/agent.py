import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def signs(environment, folder, public_key, name):
    message = os.path.join(folder, f"{name}.txt")
    with open(message, "w") as output:
        output.write("hello from the keyring\n")
    signed = subprocess.run(["ssh-keygen", "-Y", "sign", "-f", public_key, "-n", "luft", message],
                            env=environment, capture_output=True, timeout=60)
    if signed.returncode != 0:
        return False
    with open(public_key) as key, open(os.path.join(folder, "allowed"), "w") as allowed:
        allowed.write("person@luft " + key.read())
    with open(message) as data:
        verified = subprocess.run(["ssh-keygen", "-Y", "verify", "-f", os.path.join(folder, "allowed"), "-I", "person@luft",
                                   "-n", "luft", "-s", message + ".sig"], stdin=data, capture_output=True)
    return verified.returncode == 0


def as_settings(root):
    folder = os.path.join(root, "luft/apps/settings/desktop/target/debug")
    os.makedirs(folder, exist_ok=True)
    settings = os.path.join(folder, "settings")
    shutil.copy(sys.executable, settings)
    return [settings, os.path.join(HERE, "manager.py")]


def exercise_agent(root, environment, check, script, requests):
    environment = dict(environment, SSH_AUTH_SOCK=os.path.join(environment["XDG_RUNTIME_DIR"], "luft-keyring/ssh"))
    folder = os.path.join(root, "ssh")
    os.makedirs(folder)
    for kind in ("ed25519", "ecdsa"):
        key = os.path.join(folder, kind)
        subprocess.run(["ssh-keygen", "-q", "-t", kind, "-N", "", "-C", f"{kind} key", "-f", key], check=True)
        subprocess.run(["ssh-add", "-q", key], env=environment, check=True, capture_output=True)
        os.remove(key)
        check(signs(environment, folder, key + ".pub", kind), f"the agent signs with an added {kind} key")
    listed = subprocess.run(["ssh-add", "-l"], env=environment, capture_output=True, text=True).stdout
    check("ed25519 key" in listed and "ecdsa key" in listed, "the agent lists the keys it keeps")

    confirmed = os.path.join(folder, "confirmed")
    subprocess.run(["ssh-keygen", "-q", "-t", "ed25519", "-N", "", "-C", "careful key", "-f", confirmed], check=True)
    subprocess.run(["ssh-add", "-q", "-c", confirmed], env=environment, check=True, capture_output=True)
    script(access="deny", remember=False)
    check(not signs(environment, folder, confirmed + ".pub", "refused"), "a key that asks first isn't used when the person says no")
    check("SSH key" in requests("access")[-1]["request"]["title"], "using a careful key asks the person")
    script(access="allow", remember=False)
    check(signs(environment, folder, confirmed + ".pub", "confirmed"), "a key that asks first signs once allowed")

    manager = as_settings(root)
    made = subprocess.run([*manager, "generate", "Laptop"], env=environment, capture_output=True, text=True, timeout=60)
    check(made.stdout.startswith("SHA256:"), "Settings makes a new key in the keyring")
    line = subprocess.run([*manager, "public", made.stdout], env=environment, capture_output=True, text=True, timeout=60).stdout
    check(line.startswith("ssh-ed25519 ") and line.endswith(" Laptop"), "Settings shows a key's public half")
    generated = os.path.join(folder, "generated.pub")
    with open(generated, "w") as output:
        output.write(line + "\n")
    script(access="allow", remember=True)
    check(signs(environment, folder, generated, "generated"), "a key made by Settings signs")
    stranger = subprocess.run([sys.executable, os.path.join(HERE, "manager.py"), "generate", "Nope"], env=environment,
                              capture_output=True, text=True, timeout=60)
    check("AccessDenied" in stranger.stdout, "other apps can't manage SSH keys")
