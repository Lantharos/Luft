PRELOADED = {"LD_PRELOAD": "libm.so.6"}


def exercise_management(session, check, login):
    confirmations = session.confirmations

    session.script(passwords=[])
    before = len(confirmations())
    check(
        session.manager("history", extra=PRELOADED).endswith("AccessDenied") and len(confirmations()) == before + 1,
        "a program started with code preloaded into it is asked to confirm it's you, not let in",
    )
    check(
        confirmations()[-1]["request"]["title"] == "Confirm it's you",
        "managing the keyring asks you to confirm it's you",
    )

    session.script(passwords=["guess", login])
    attempts = len(session.authentications())
    check(session.manager("history") == "ok", "the history opens once you confirm it's you")
    check(
        "isn't your password" in confirmations()[-1]["request"].get("warning", "")
        and [entry["accepted"] for entry in session.authentications()[attempts:]] == [False, True],
        "a wrong password is checked with the sign-in service and refused",
    )

    session.script(passwords=[login])
    before = len(confirmations())
    check(
        session.manager("history-twice") == "ok|ok" and len(confirmations()) == before + 1,
        "a confirmation lasts for the program that asked",
    )
    session.script(passwords=[])
    check(
        session.manager("history") == "org.freedesktop.DBus.Error.AccessDenied"
        and len(confirmations()) == before + 2,
        "another program has to confirm again",
    )

    made = session.manager("generate", "Spare")
    before = len(confirmations())
    check(
        session.manager("remove", made) == "org.freedesktop.DBus.Error.AccessDenied"
        and len(confirmations()) == before + 1,
        "deleting an SSH key asks you to confirm it's you",
    )
    session.script(passwords=[login])
    check(
        session.manager("remove", made) == "ok" and "Spare" not in session.manager("keys").split(","),
        "an SSH key is deleted once you confirm it's you",
    )
