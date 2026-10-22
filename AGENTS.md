# Agent Instructions

- Never add Co-Authored-By, "Generated with", or any other AI or tool attribution lines to commit messages or pull request descriptions.
- Commit with signed commits; signing is configured. Stage only your own files, since other work may be happening in the same tree.
- Keep READMEs short. Detail belongs in `docs/`, written for people.
- Headless Kestrel test sessions run on a private system bus, but still set `KESTREL_SESSION_DIR` and `KESTREL_CAPTURE_DIR` to scratch folders, never remove `session.sh`'s blocking service files, and never type a real password into a prompt.
- Test disk, boot and install changes in VMs (`os/vm`), never with loop devices or mounts on the host.
