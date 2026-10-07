import os
import subprocess

from ownership import READER, program_at

RELAY = "import subprocess, sys; sys.stdout.write(subprocess.run(sys.argv[1:], capture_output=True, timeout=60).stdout.decode())"


def exercise_sabine(home, environment, check, script, requests):
    sabine = os.path.join(home, ".local/share/sabine")
    host = program_at(os.path.join(sabine, "bin/versions/0.33/sabine-host"))
    bumped = program_at(os.path.join(sabine, "bin/versions/0.34/sabine-host"))
    built = program_at(os.path.join(sabine, "runtimes/cef/154.0.34+g14c5a08+chromium-154.0.8037.98-minimal/.sabine-hosts/721e89c95376d94d/sabine-host"))
    mailman = program_at(os.path.join(sabine, "apps/com.lantharos.mailman/install/mailman"))
    raday = program_at(os.path.join(sabine, "apps/com.lantharos.raday/install/raday"))
    limbo = program_at(os.path.join(sabine, "apps/al.kaleid.limbo/install/limbo"))

    def hosted(app, host, action):
        return subprocess.run([app, "-c", RELAY, host, READER, action], env=environment, capture_output=True, timeout=90).stdout.decode()

    def asked():
        return len(requests("access"))

    script(access="deny", remember=False)
    before = asked()
    mail_key = hosted(mailman, host, "safe-storage")
    raday_key = hosted(raday, host, "safe-storage")
    limbo_key = hosted(limbo, host, "safe-storage")
    check(len({mail_key, raday_key, limbo_key, "browser-key"}) == 4 and "" not in (mail_key, raday_key, limbo_key) and asked() == before,
          "each Sabine app keeps its own Chromium key instead of asking for the browser's")
    check(hosted(mailman, host, "safe-storage") == mail_key and hosted(limbo, host, "safe-storage") == limbo_key and asked() == before,
          "a Sabine app finds its own Chromium key again without being asked")
    check(hosted(mailman, bumped, "safe-storage") == mail_key and hosted(raday, built, "safe-storage") == raday_key and asked() == before,
          "a Sabine app keeps its key when Sabine updates or rebuilds its host")

    running = subprocess.Popen([mailman, "-c", "import time; time.sleep(60)"], env=environment)
    try:
        forged = subprocess.run([host, READER, "safe-storage", f"--sabine-parent-pid={running.pid}"], env=environment,
                                capture_output=True, timeout=60).stdout.decode()
    finally:
        running.kill()
        running.wait()
    check(forged not in ("", mail_key), "a Sabine host started by another program can't pass itself off as the app it names")

    mail_portal = hosted(mailman, host, "portal").split("|")[0]
    raday_portal = hosted(raday, host, "portal").split("|")[0]
    check(len(bytes.fromhex(mail_portal)) == 64 and mail_portal != raday_portal and hosted(mailman, bumped, "portal").split("|")[0] == mail_portal,
          "each Sabine app gets its own portal secret, kept across host updates")
