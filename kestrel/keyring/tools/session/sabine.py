import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def exercise_sabine(session, check):
    subprocess.run(
        ["secret-tool", "store", "--label", "Chromium Safe Storage", "application", "chromium"],
        input=b"browser-key",
        env=session.environment,
        check=True,
    )
    host = os.path.join(session.root, "sabine/sabine-host")
    os.makedirs(os.path.dirname(host))
    shutil.copy(sys.executable, host)

    def hosted():
        reader = os.path.join(HERE, "reader.py")
        return session.run([host, reader, "safe-storage"])

    def asked():
        return len(session.requests("access")) + len(session.requests("password"))

    before = asked()
    sabine_key = hosted()
    check(
        sabine_key not in ("", "browser-key") and asked() == before,
        "the Chromium Sabine apps share keeps its own key instead of taking your browser's",
    )
    check(
        hosted() == sabine_key and asked() == before,
        "Sabine's Chromium finds its own key again",
    )
    check(
        session.reader("read", "application", "chromium") == "browser-key",
        "your browser still finds only its own key",
    )
