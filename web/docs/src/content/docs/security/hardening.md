---
title: Hardening
description: The kernel settings, consoles, USB protection, crash handling and service sandboxes that narrow what an attacker can reach.
sidebar:
  order: 6
---

Beyond the signed startup and the encrypted disk, Luft closes the smaller ways into a running computer. Each measure here was chosen because it costs nothing noticeable and breaks nothing Luft ships: games and their anti-cheat, containers, Waydroid and debuggers keep working.

## Kernel settings

The image adds these to Fedora's defaults, as `sysctl` settings in `/usr/lib/sysctl.d/60-luft-hardening.conf` and on the signed kernel command line:

| Setting | Why |
| --- | --- |
| `kernel.kptr_restrict=2` | Kernel addresses in `/proc` read as zero for everyone, so a leak can't aim an exploit. A profiler that needs them can lower it for the session |
| `kernel.unprivileged_bpf_disabled=1` | Only root loads eBPF programs, and this can't be turned back until the next start |
| `net.core.bpf_jit_harden=2` | Constants in compiled BPF programs are blinded, so a filter can't smuggle machine code into the kernel |
| `kernel.yama.ptrace_scope=1` | A program can only trace programs it started itself, so one of yours can't attach to Kestrel or an app after the fact and act in its name. Attaching a debugger to a running program needs `sudo` |
| `dev.tty.ldisc_autoload=0` | A program without privileges can't make the kernel load a rarely used line discipline, a recurring source of kernel bugs |
| `lockdown=integrity` | Even root can't write kernel memory or load unsigned code into the kernel |
| `sysctl.kernel.kexec_load_disabled=1` | Nothing can replace the running kernel behind Secure Boot's back |
| `slab_nomerge`, `init_on_alloc=1`, `randomize_kstack_offset=on` | Separate memory pools per object type, zeroed allocations and a shifted kernel stack per system call. Fedora builds these in; naming them keeps them if a default changes |
| `page_alloc.shuffle=1` | Free pages are handed out in shuffled order, so heap layouts are harder to predict |
| `vsyscall=none` | Removes a fixed-address page only programs built before 2012 call into |

`kernel.perf_event_paranoid` stays at Fedora's 2, since 3 needs a kernel patch Fedora doesn't carry. User namespaces, CPU mitigations and zeroing memory on free stay as Fedora has them: changing them would cost speed or break sandboxes, containers and debuggers.

With Secure Boot off, SushiBoot starts the kernel without `lockdown=integrity`, so drivers you build yourself load and nothing is locked down against the computer's owner. The IOMMU and kexec settings apply either way.

## Games with anti-cheat

Easy Anti-Cheat for Linux, and others like it, only let a game run when the computer can show it started the way its maker intended. Luft meets each of Epic's requirements by default:

| Requirement | How Luft meets it |
| --- | --- |
| Signed kernel and drivers | The kernel is in the signed startup image, Fedora signs its drivers and Luft's key signs NVIDIA's |
| TPM 2.0 | Used when the computer has one |
| Secure Boot with well-known keys only | Only Fedora's shim, Luft's key and shim's own key. Any other key added to shim counts against it, since shim trusts those for drivers too |
| Measured startup | The firmware measures shim, SushiBoot and the startup image into PCR 4, shim the Secure Boot state into PCR 7, SushiBoot `loader.conf` into PCR 5 and any command line it passes into PCR 12, and the startup image's stub itself into PCR 11 |
| IOMMU on, without passthrough | `intel_iommu=on iommu.passthrough=0`; AMD's is on by itself |
| Kernel lockdown in integrity mode, and kexec off | Set on the signed command line |
| The BPF security module | Part of Fedora's kernel |

`trustctl anti-cheat` lists each requirement. [Security](/system/security/#games-with-anti-cheat) covers what people see, including removing other keys from shim.

## Text consoles

A login on a text console, on another virtual terminal or a serial port, is a second way in that skips everything the login screen enforces. So text consoles only start while Developer tools is on. `getty@`, `kmsconvt@` and `serial-getty@` each carry an `ExecCondition=` that reads the switch from a file only root can write. logind starts a console each time someone switches to an empty virtual terminal, so the condition is checked every time; with the switch off, the terminal stays blank and switching back returns to the screen that was there. Turning the switch off also stops the consoles that run, which ends a sign-in there.

systemd only adds a serial console for one named on the signed kernel command line, a virtual machine's own console, or credentials, which it also takes from the firmware's SMBIOS strings on real hardware, so the condition covers serial ports too. The debug shell on the ninth console is masked. Rescue and the shells of the screen that says Luft couldn't start keep their own rules ([When Luft can't start](/developers/system/recovery/#opening-a-shell)).

## USB protection

While the screen is locked, and at the login screen, new USB devices wait until someone unlocks. It uses the kernel's `authorized_default` and `interface_authorized_default` switches per bus, so it costs nothing while unlocked. It isn't meant to run alongside USBGuard.

- Hubs, and keyboards and mice that say so themselves with USB's boot protocol, connect right away, so the password can always be typed. For a device with several parts, only those parts connect: storage, network, serial, audio, vendor-specific and every other input part, security keys among them, wait. A gadget that poses as a keyboard and a network adapter at once gets only its keyboard, and the many drivers for special input devices stay out of reach of whoever holds the locked computer.
- A dock plugged in while locked brings buses of its own, so the kernel's policy for new buses is set to hold as well while locked, and put back at unlock.
- A device that switches to a different set of parts while locked, as a phone does once it trusts the computer, keeps its connected parts, and the new ones wait like those of a new device.
- At unlock, everything that waited connects, Kestrel names it in a notification, and each device that waited as a whole is announced again as if just plugged in, so what sets devices up, such as printer setup, sees it. A device whose new parts waited isn't announced again, since that would switch it back. An iPhone that waited isn't handed to `usbmuxd` until it connects, so it pairs at unlock instead of being left half set up.
- Kestrel says when the screen locks and unlocks with `SetLocked` on `com.lantharos.UsbProtection1`. The service takes that only from Kestrel itself, installed with the system and running in the desktop's own unit of the person whose session is on screen ([Who an app is](/security/identity/)). logind's lock hint, which any program in the session may set, plays no part. A desktop counts as locked until its shell says otherwise, and again the moment that shell leaves the bus, so a shell that crashes while locked lets nothing in. A text console has no lock screen, so whoever signed in there counts as unlocked.
- Stopped on purpose, the service lets everything that waited connect. When it fails, what waited keeps waiting, and systemd starts it again a second later.

## Changing files that aren't yours

Rover and Barometer run as you, so they can't change the system's files or another person's, or stop their programs. When you ask for that, they call `luft-files` (`com.lantharos.Files1`), a service that runs as root only while it has work. It can copy, move, rename, delete and trash items, make a file or folder, and signal or reprioritise a process, and nothing else: there is no way to hand it a command to run.

Every call is checked with polkit. The prompt says what is about to happen, such as Delete “/etc/fstab” for good, with the path or process name as the service sees it, and polkit rules can decide on the same details (`operation`, `path`, `target`, `count`, `processes`). The password covers exactly the call the prompt described: the next change asks again, so a program can't get one harmless change approved and make others on its back. One action is one call, so moving a hundred files into a system folder asks once, with a prompt that counts them. Only someone at the computer itself can be asked; network sessions, background sessions and a locked screen get nothing.

It opens each folder on the way without following links and treats each item as what it is, so a link slipped in meanwhile can't point it elsewhere. Nothing is replaced or merged into: a copy or move whose target exists fails, and one that fails halfway removes only what it made. Copies belong to the owner of the folder they land in and lose setuid and setgid. Processes are named by number and start time, so a reused number is left alone.

## The login screen's pictures

The pictures on the login screen are chosen by each person, and the service that keeps them for the login screen runs as root. It never decodes a picture itself: it hands the open file to a child process that gives up every system call except those for memory, threads and writing its output, decodes, and writes back a JPEG of at most 64 MB within a minute. A picture made to break the decoder ends up in a process that can't open, send or start anything.

## Service sandboxing

Each of Luft's services runs with only what it needs: a read-only view of the system with write access to its own folders, no network, devices or capabilities it doesn't use, and a filter on its system calls. Services that hand their sandbox on to programs they start, such as cloud drives and Kestrel's settings, or that start containers, keep fewer of these limits so those programs keep working.

`systemd-analyze security` scores how exposed each service is, and the repository records that score for every one. The checks fail when a service scores worse than recorded or a new one has none, so a change that loosens a sandbox has to say so ([Testing](/developers/testing/)).
