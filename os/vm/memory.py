import os
import time

from control import MachineError

PASSPHRASE = os.environ.get("VM_PASSPHRASE", "luft-vm-disk")
MANAGER = "/sys/fs/cgroup/user.slice/user-1000.slice/user@1000.service"
HOG = "/usr/libexec/luft-memory-check/hog.py"
HEALTH = "com.lantharos.Kestrel /com/lantharos/Kestrel/Health com.lantharos.Kestrel.Health Check"
WINDOWS = "com.lantharos.Kestrel /com/lantharos/Kestrel/Memory com.lantharos.Kestrel.Memory Windows"
ZSWAP = (("enabled", "Y"), ("compressor", "zstd"), ("shrinker_enabled", "Y"))
AUDIT = "{ journalctl -b -o cat; cat /var/log/audit/audit.log 2>/dev/null; } | grep 'avc:  denied'"
GIB = 1 << 30
MIB = 1 << 20


class Memory:
    def __init__(self, check, user: str):
        self.check = check
        self.user = user
        self.started = check.output("date '+%Y-%m-%d %H:%M:%S'")

    def systemctl(self, arguments: str) -> str:
        return f"systemctl --user --machine={self.user}@ {arguments}"

    def as_user(self, command: str) -> str:
        return self.check.output(f"systemd-run --user --machine={self.user}@ --wait --pipe --quiet {command}")

    def open(self, name: str, title: str, mode: str, mebibytes: int, rate: int = 0) -> str:
        unit = f"app-memorycheck-{name}@1.service"
        app = f"com.lantharos.MemoryCheck.{name}"
        self.check.output(
            f"systemd-run --user --machine={self.user}@ --unit={unit} --slice=app.slice "
            f"--setenv=WAYLAND_DISPLAY=wayland-0 python3 {HOG} '{title}' {app} {mode} {mebibytes} {rate}"
        )
        holding = f"journalctl _SYSTEMD_USER_UNIT={unit} -o cat | grep -q 'holding {mebibytes}'"
        self.check.wait(f"{title} holds {mebibytes} MiB", lambda: self.check.succeeds(holding), 300, every=3)
        return unit

    def close_all(self):
        self.check.shell(self.systemctl("stop 'app-memorycheck-*'"))

    def running(self, unit: str) -> bool:
        return self.check.succeeds(self.systemctl(f"is-active --quiet {unit}"))

    def number(self, path: str) -> int:
        return int(self.check.output(f"cat {path}"))

    def usage(self, unit: str) -> tuple[int, int]:
        cgroup = f"{MANAGER}/app.slice/{unit}"
        return self.number(f"{cgroup}/memory.current"), self.number(f"{cgroup}/memory.swap.current")

    def kept(self, unit: str) -> int:
        return int(self.check.output(self.systemctl(f"show -P MemoryLow {unit}")))

    def budget(self) -> int:
        return self.number(f"{MANAGER}/memory.low") - self.number(f"{MANAGER}/session.slice/memory.low")

    def swap_files(self) -> list[tuple[str, int, int]]:
        rows = (line.split() for line in self.check.output("tail -n +2 /proc/swaps").splitlines())
        return [(row[0], int(row[2]) * 1024, int(row[3]) * 1024) for row in rows]

    def vmstat(self, field: str) -> int:
        return int(self.check.output(f"awk '$1 == \"{field}\" {{print $2}}' /proc/vmstat"))

    def kestrel_waiting(self) -> int:
        return int(self.as_user(f"busctl --user call {HEALTH}").split()[1])

    def windows(self) -> str:
        return self.as_user(f"busctl --user get-property {WINDOWS}")

    def logged(self, text: str) -> bool:
        journal = f"journalctl --since='{self.started}' -o cat _SYSTEMD_USER_UNIT=kestrel-settings.service"
        return self.check.succeeds(f"{journal} | grep -qF '{text}'")

    def denials(self) -> str:
        return self.check.shell(AUDIT)[1].strip()


def swap_is_set_up(check, watch: Memory):
    files = watch.swap_files()
    if [name for name, _, _ in files] != ["/var/swap/0"] or not 3.9 * GIB < files[0][1] <= 4 * GIB:
        raise MachineError(f"Luft started with other swap than one 4 GB file: {files}")
    settings = check.output("grep -H . /sys/module/zswap/parameters/{enabled,compressor,shrinker_enabled}")
    if not all(f"{name}:{value}" in settings for name, value in ZSWAP):
        raise MachineError(f"zswap isn't set up: {settings}")
    if (label := check.output("stat -c %C /var/swap /var/swap/0")).count("swapfile_t") != 2:
        raise MachineError(f"the swap files aren't labelled for swap: {label}")
    if "C" not in check.output("lsattr /var/swap/0").split()[0]:
        raise MachineError("the swap file isn't NOCOW")
    if not check.succeeds("btrfs subvolume show /var/swap"):
        raise MachineError("/var/swap isn't a subvolume of its own")
    if not check.succeeds("dmsetup table $(findmnt -no SOURCE /var | sed 's|\\[.*||') | grep -q crypt"):
        raise MachineError("/var isn't on an encrypted drive")
    check.log(f"one 4 GB swap file in an encrypted subvolume, swapfile_t and NOCOW, behind zswap: {settings.split()}")


def big_game_keeps_its_memory(check, watch: Memory):
    budget = watch.budget()
    notes = watch.open("notes", "Notes", "idle", 2400)
    chat = watch.open("chat", "Chat", "idle", 1900)
    game = watch.open("game", "Harbour Run", "stable", 2300)
    check.wait("the fullscreen game's memory is kept",
               lambda: watch.kept(game) == budget and watch.kept("app.slice") == budget, 60, every=2)
    check.log(f"the game keeps {budget / GIB:.2f} GB; Kestrel lists {watch.windows()}")
    worst, grew, written_back = 0, False, watch.vmstat("zswpwb")
    for _ in range(36):
        time.sleep(5)
        worst = max(worst, watch.kestrel_waiting())
        files = watch.swap_files()
        grew = grew or len(files) > 1
        game_ram, game_swap = watch.usage(game)
        background = watch.usage(notes)[1] + watch.usage(chat)[1]
        check.log(
            f"swap {sum(file[2] for file in files) / GIB:.2f} of {sum(file[1] for file in files) / GIB:.2f} GB "
            f"in {len(files)} files; game {game_ram / GIB:.2f} GB in memory and {game_swap / MIB:.0f} MB swapped; "
            f"background apps {background / GIB:.2f} GB swapped; Kestrel waited at most {worst} ms"
        )
    written_back = watch.vmstat("zswpwb") - written_back
    check.screenshot("game-under-pressure")
    if not all(watch.running(unit) for unit in (game, notes, chat)):
        raise MachineError("an app was closed although the desktop never got stuck")
    if game_swap > 0.1 * game_ram or background < 2 * GIB:
        raise MachineError("the background apps weren't swapped before the game")
    if not grew:
        raise MachineError("swap didn't grow while it filled")
    if worst > 1000:
        raise MachineError(f"Kestrel waited {worst} ms for a frame")
    if written_back <= 0:
        raise MachineError("zswap wrote nothing back to the swap files")
    check.log(f"the game stayed in memory, swap grew, zswap wrote {written_back} pages to the files")
    watch.close_all()


def swap_shrinks(check, watch: Memory):
    check.wait("the extra swap file goes away once nothing needs it",
               lambda: [name for name, _, _ in watch.swap_files()] == ["/var/swap/0"], 600, every=15)
    if (left := check.output("ls /var/swap")) != "0":
        raise MachineError(f"swap files were left behind: {left}")


def growing_game_is_blamed(check, watch: Memory):
    notes = watch.open("notes", "Notes", "idle", 1500)
    chat = watch.open("chat", "Chat", "idle", 1000)
    leak = watch.open("leak", "Leaky Game", "grow", 512, 48)
    check.wait("the growing game is warned about",
               lambda: watch.logged(f"Warned that {leak} keeps using more memory"), 600, every=5)
    check.screenshot("growing-game-warning")
    if watch.kept(leak) != 0:
        raise MachineError("the growing game kept its protection")
    check.log("the game that keeps growing past its share lost its protection and was warned about")
    check.wait("the growing game is closed", lambda: not watch.running(leak), 900, every=5)
    closer = "Luft" if watch.logged(f"so {leak} was closed") else "the kernel"
    if not (watch.running(notes) and watch.running(chat)):
        raise MachineError("a background app was closed instead of the game that kept growing")
    check.log(f"{closer} closed the growing game while the background apps kept running")
    check.screenshot("growing-game-closed")
    watch.close_all()


def memory(check, user: str):
    check.start("installed")
    check.enroll_key()
    check.unlock_disk(PASSPHRASE)
    check.wait_for_greeter()
    check.sign_in()
    watch = Memory(check, user)
    swap_is_set_up(check, watch)
    big_game_keeps_its_memory(check, watch)
    swap_shrinks(check, watch)
    growing_game_is_blamed(check, watch)
    if found := watch.denials():
        raise MachineError(f"SELinux denied something: {found}")
    check.log("SELinux denied nothing")
    check.collect()
