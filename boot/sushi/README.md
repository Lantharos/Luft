# Sushi

Sushi is the boot splash for Luft. It keeps the firmware logo on screen from the moment the computer powers on, adds a spinner below it, asks for the disk passphrase when the disk is encrypted, follows the screen when the graphics driver takes over, and hands the display to the login screen without the screen going black or showing text in between. It shows progress while updates install, and brings the logo back when the computer restarts or shuts down. It replaces Plymouth.

In the Luft monorepo, Sushi lives at `boot/sushi`. Run the commands below from that directory.

## What a boot looks like

1. The firmware draws its logo. Sushi draws the same logo in the same place, so the first frame it shows is identical to what's already there, then fades a spinner in underneath.
2. If the disk is encrypted, the spinner gives way to a passphrase field. A wrong passphrase shakes the field and says so; Caps Lock shows a warning. Keys are read through the console keymap, so the layout set in `/etc/vconsole.conf` applies. Sushi reads the disk's LUKS header to know how it unlocks:
   - When the TPM unlocks the disk, nothing is asked at all.
   - With a TPM PIN, it says "Enter your PIN"; a security key's PIN is asked for by name too.
   - When the TPM doesn't unlock a disk it normally unlocks, Sushi asks for the recovery key (or the passphrase, if the disk has one) and says why in a sentence: something about how the computer starts has changed, the TPM isn't responding, or the PIN didn't work. Recovery keys can be typed with or without their dashes, and Sushi counts the characters as they're typed.
3. When the system switches from the initramfs to the installed system, Sushi keeps running and keeps the splash on screen.
4. When the graphics driver replaces the firmware framebuffer, Sushi moves to the new device and sets the display arrangement the login screen saved, resolution and refresh rate, so the login screen and desktop find the monitor already in its final mode and never switch it again. How that looks depends on the driver (see [When the graphics driver takes over](#when-the-graphics-driver-takes-over)): either nothing visibly changes, or the logo fades to black and back once. Until then Sushi shows only the logo, so nothing it shows gets cut off.
5. When the login screen starts, Sushi fades the spinner out, leaves the logo on screen, and lets go of the display. The login screen's first frame shows the same logo before its own interface fades in.
6. Sushi then stays in the background holding the display open, so that when one session ends and the next begins (signing in, signing out), the last frame stays on screen instead of the kernel's text console taking over.
7. When the computer restarts or shuts down, Sushi takes the display back the moment the login screen or session lets go of it, clears the pointer and anything else they left on screen, and shows the logo and spinner until the computer turns off.

### When the firmware doesn't use the monitor's own resolution

Some firmware hands over a framebuffer smaller than the monitor, such as 1024×768 on a 3440×1440 ultrawide, and the monitor stretches it to fill the screen. SushiBoot avoids this by switching to the monitor's resolution before Linux starts (see [SushiBoot](#sushiboot)). When Linux still starts on a stretched framebuffer, for example through GRUB, Sushi draws the splash so it looks right once stretched:

- The firmware only records where it drew its logo, not on which screen. Firmware centers its logo, so twice the logo's distance from the left edge plus its width gives the width of the screen it was drawn on, and the monitor gives the height. Sushi then scales the logo into the framebuffer at the same place on the monitor.
- When the monitor's shape is known, the spinner and text are drawn squeezed by exactly as much as the monitor will stretch them, so they come out round and centered. Sushi learns the monitor's resolution from its EDID, when the framebuffer device has one, or from the saved display arrangement, which the initramfs carries for this. If neither is available, Sushi draws square pixels.
- When the graphics driver takes over at the monitor's resolution, the splash crossfades from how it looked on the stretched framebuffer to the sharp one, or fades back in sharp when the driver switched the screen off.

### When the graphics driver takes over

Some drivers take over the picture the firmware left on screen, others switch the display off for a moment. Sushi tells them apart and makes the moment look deliberate either way:

- Drivers that keep the picture: Intel's (i915 and xe) on any screen, and AMD's on a laptop's built-in panel. When the firmware's mode is already the saved one, the hand-over is invisible: the logo stays exactly where it is and the spinner fades in once the driver is there. When the saved mode differs, for example 120 Hz on a panel the firmware started at 60 Hz, Sushi fades the logo out, switches the mode on a black screen, waits for the panel, and fades back in.
- Drivers that switch the display off: AMD's on external monitors and desktop cards, and anything else that doesn't keep the picture. Sushi shows black in the saved mode right away, waits for the monitor to pick the signal back up, and fades the splash in.
- NVIDIA's driver, which always switches the display off when it first sets a mode, isn't left to start whenever udev gets to it. Sushi loads it itself right after its first frame: it fades the logo to black in a fifth of a second, loads the driver, sets the saved mode on a black frame, waits for the monitor, and fades the splash back in over a second. With the driver in the initramfs, this happens in the first seconds of the boot, before the installed system starts.

The wait for the monitor is `monitor-resync` in `/etc/sushi/sushi.conf`, one second by default. A monitor gives no signal when it's showing a picture again; most DisplayPort and HDMI monitors take half a second to a second after a mode change, longer when the refresh rate changes. The fade-in that follows takes another second, so a monitor that's a little slower still shows most of it. If the splash is already partly bright when the picture comes back, raise it (for example `monitor-resync = 1.5`) and rebuild the initramfs, since it carries a copy of the file.

Drivers Sushi loads itself are listed in `/usr/lib/modprobe.d/sushi.conf` as `blacklist` lines, which keeps udev from loading them on its own; a file with the same name in `/etc/modprobe.d` replaces the list. The initramfs carries those drivers, with the firmware they need for the cards in the computer, whenever the computer has such a card. `sushi-drivers.service` makes sure they load even when Sushi doesn't: when the kernel command line doesn't turn Sushi on, when it stopped, in rescue mode, or when the initramfs didn't have the driver yet (for example right after a kernel update, before akmods built NVIDIA's driver for it). It asks Sushi to take the display over, and loads the driver directly if Sushi doesn't answer within 20 seconds. It runs before the login screen starts.

On a laptop with two graphics cards, only the card that drives the screen the firmware used gets this treatment. A second card's driver loads in the background without touching the splash.

## Updates

Sushi understands the commands of Plymouth's `plymouth` tool, so anything that reports progress through Plymouth works with it unchanged: `dnf5 offline` and `dnf5 system-upgrade`, PackageKit's offline updates, and fwupd. While updates install, the spinner stays where it is and a few lines appear below it:

- "Installing updates", "Upgrading Fedora Linux" (the name comes from `/etc/os-release`), or "Updating firmware"
- a progress bar and "42% complete. Don't turn off your computer." once the updater reports progress
- the package being installed, such as "Upgrading firefox", when the updater says so in plain words

When the updater restarts the computer, the text fades out and the logo and spinner stay until the computer restarts.

Requests that need someone at the keyboard, like Plymouth password prompts, are declined; disk passphrases still go through Sushi's own prompt.

While a disk is being encrypted in place, the few seconds before the system is mounted show "Encrypting your device" in place of the spinner, with a bar that slides until the step is done; `sushictl show encrypting` shows the same screen.

### Adding a Secure Boot key

Shim asks in person before it trusts a new key, on a blue screen that appears right after the firmware and waits only ten seconds. When a key is waiting for that screen, the next restart first shows what to expect: press a key when the screen appears, choose Enroll MOK, Continue and Yes, type the one-time code, and choose Reboot. Sushi holds the restart on that screen until Enter is pressed, for up to four minutes. When the key wasn't added at the last restart and a new code was asked for, the screen starts by saying so.

```bash
sushictl notice key-enrollment 48217730           # explain the screen at the next restart, with this code
sushictl notice key-enrollment 48217730 --again   # the same, after the key wasn't added last time
sushictl notice clear
```

### Explaining something before the login screen

Other parts of the system can put a short explanation on screen while the computer starts, in place of the spinner and before the login screen. Kestrel uses this after the computer had to restart because the graphics driver stopped responding. The notice is described in a small text file, one field per line:

```text
title Your computer restarted because the graphics driver stopped responding
line It happened today at 20:10.
step Turn on Above 4G Decoding and Resizable BAR in the firmware settings
footer Press F to open the firmware settings, or Enter to continue. Continuing in {seconds} seconds.
countdown 20
key f
```

`line` and `step` can repeat; steps are numbered. `{seconds}` in the footer counts down, and the notice goes away by itself when it reaches zero. `key` lets a letter dismiss the notice as well as Enter.

```bash
sushictl notice show /run/example/notice   # waits until the notice is gone, and prints the letter if one dismissed it
```

`plymouth quit` returns to the text console, as it does with Plymouth, which is what the emergency and rescue shells rely on.

## Components

| Crate | Role |
|-------|------|
| `sushi-scene` | The scene every stage draws: firmware logo placement, spinner, passphrase field, text in Open Runde. Works without the standard library so SushiBoot shares it. |
| `sushi` | Display handling (DRM/KMS), console and keyboard, password requests, the control socket, Plymouth's client protocol |
| `sushid` | The splash itself |
| `sushictl` | Talks to `sushid` |
| `sushiboot` | The UEFI boot menu Luft starts through, drawn with the same scene |

`data/` holds the systemd units, the drop-ins for greetd, Plymouth's boot units and the console password agent, the dracut module, the list of drivers Sushi loads itself, and the default configuration.

## Installing on Fedora

Sushi installs next to Plymouth. Both are in the initramfs, and the kernel command line decides which one runs, so Plymouth stays as a fallback until you're happy with Sushi. Keep the `plymouth` package installed either way: its `plymouth` tool is what updaters use to report progress, and Sushi answers it.

```bash
boot/sushi/scripts/install.sh install   # build, install, rebuild the initramfs and signed images
boot/sushi/scripts/install.sh try       # use Sushi for the next boot only
boot/sushi/scripts/install.sh enable    # use Sushi on every boot
boot/sushi/scripts/install.sh disable   # back to Plymouth on every boot
boot/sushi/scripts/install.sh remove    # take Sushi off the computer entirely
```

On Luft the kernel command line is part of the signed startup images, so these go through `trustctl startup arguments` (see `security/README.md`). `try` starts the next boot once with Sushi's arguments added; if anything goes wrong, restarting brings back the usual startup. `enable` and `disable` change the arguments in every signed image, and kernels installed later inherit them. The script needs `sudo` and Luft's signed startup.

### Kernel arguments

These are what `try` and `enable` add:

| Argument | Why |
|----------|-----|
| `sushi` | Turns Sushi on |
| `plymouth.enable=0` | Keeps Plymouth from starting alongside it |
| `quiet loglevel=3` | Only critical kernel messages reach the screen |
| `systemd.show_status=false` | No service status lines on the console, not even on slow boots |
| `rd.udev.log_level=3 udev.log_level=3` | Quiet device setup in the initramfs and after it |
| `vt.global_cursor_default=0` | No blinking cursor on the console |
| `fbcon=vc:0-5` | The text console only draws on the first six virtual terminals, so the seventh, where the login screen and sessions run, never shows text |

`rd.systemd.show_status` isn't needed: systemd reads `systemd.show_status` in the initramfs too.

Keep the firmware's boot menu hidden so nothing draws between the firmware logo and Sushi. SushiBoot draws nothing unless a key is held while it starts.

### The login screen

Sushi works with any display manager that starts its compositor after running `sushictl deactivate` and draws its first frame within a few seconds. For greetd, Sushi installs a drop-in that does exactly that, after waiting for the graphics driver to finish loading so the login screen never starts on a framebuffer that's about to disappear. Display managers Sushi doesn't know about are handled by `sushi-quit.service`, which closes the splash when the system has finished starting. While Sushi runs, Plymouth's own `plymouth-quit` units stay out of the way.

With Kestrel's login screen, set greetd to the seventh virtual terminal (`vt = 7` in `/etc/greetd/config.toml`, which Kestrel's `greetd.toml` already does), so the text console never shares a terminal with graphical sessions.

`/etc/sushi/sushi.conf` has two settings:

```ini
monitors = /var/lib/kestrel-greeter/display/monitors.xml
monitor-resync = 1.0
```

Kestrel copies your display arrangement there whenever you change it, and Sushi and the login screen both start in that mode. The initramfs carries a copy, so Sushi knows the monitor's shape before the graphics driver loads; the copy is refreshed whenever the initramfs is rebuilt.

### NVIDIA

Keep `nvidia-drm.fbdev=1` (the default with current drivers). Without it, the driver turns every screen off whenever a program lets go of the display, which undoes the hand-over.

The NVIDIA driver can't take over the picture the firmware left on screen: the first time anything sets a display mode on it, it switches the display off and on again. Sushi makes that its own moment, as described above, and sets the saved arrangement (for example 3440×1440 at 165 Hz) in the same step, so the monitor picks the signal up once per start and never again at the login screen or when signing in.

Only `nvidia_drm`, the part that drives the display, waits for Sushi. The rest of the driver loads as usual while the splash shows, so the hand-over itself takes a fraction of a second. On Luft's signed startup, the initramfs is rebuilt whenever akmods builds the driver for a kernel or a new driver version, so the initramfs and the installed system always carry the same version (see `security/README.md`).

## sushictl

```bash
sushictl status        # showing, leaving, waiting, or holding
sushictl deactivate    # fade the spinner out and let the next program take the display
sushictl quit          # close the splash and return to the text console
sushictl show updates  # take the display back and show the splash for boot-up, shutdown, updates, system-upgrade or firmware-upgrade
sushictl load-drivers  # load the graphics drivers Sushi takes over, through Sushi when it's showing
```

`sushictl update-root` is used by the initramfs while switching to the installed system, and `sushi-shutdown.service` runs `sushictl show shutdown` when the computer restarts or shuts down.

The `plymouth` tool works too, for example to preview the update screen:

```bash
sudo plymouth change-mode --updates
sudo plymouth system-update --progress=40
sudo plymouth display-message --text="Upgrading firefox"
```

`journalctl -u sushi` shows what Sushi did on this boot: which display it used, when it handed over, and how long the next program took to draw.

## SushiBoot

SushiBoot is the boot menu Luft starts through. It reads [Boot Loader Specification](https://uapi-group.org/specifications/specs/boot_loader_specification/) entries and unified kernel images from every EFI system partition, finds Windows and other installed systems, and draws the menu below the firmware logo. With `timeout 0` in `loader/loader.conf` it starts the default entry without showing anything; holding any key while it starts shows the menu.

The menu has, in order:

- the newest unified kernel image of each system in `EFI/Linux`, titled with the system's name,
- the extra profiles of that image that have a title, such as Rescue,
- Previous versions, listing the older images by kernel version (Esc goes back),
- Boot Loader Specification entries,
- other systems on the partition: Windows Boot Manager, and for every other vendor folder in `EFI` its shim, or its GRUB or systemd-boot when there's no shim,
- Firmware settings, when the firmware can be asked to open its own settings at the next start.

If the chosen entry doesn't start, for example because its kernel is missing, the menu comes back saying so, and another entry can be chosen.

A loader that turns out to be SushiBoot itself, such as Fedora's `grubx64.efi` once Luft has taken GRUB's place, is left out, so no entry starts the menu again.

Entries have the identifiers systemd-boot uses: an image's file name without its boot counter, with `@` and the profile's ID for multi-profile images, such as `luft-7.2.8-300.fc45.x86_64.efi@rescue`. `default` in `loader.conf` takes patterns such as `luft-*`, which matches the newest image. SushiBoot reports itself, its entries and the one it started through the Boot Loader Interface variables, and honors `LoaderEntryDefault` and `LoaderEntryOneShot`, so `bootctl status` and `bootctl list` show what started, and `bootctl set-oneshot ID` chooses the next start.

Images count their tries in the file name the way systemd-boot does. `luft-7.2.8-300.fc45.x86_64+3.efi` has three tries left; just before starting its main profile, SushiBoot renames it to `luft-7.2.8-300.fc45.x86_64+2-1.efi`, and the running system renames it to `luft-7.2.8-300.fc45.x86_64.efi` once it has started properly. An image with no tries left goes under Previous versions, so the newest image that still has tries, or that is known to work, starts by default. Other profiles, such as Rescue, start without counting.

Before showing anything, SushiBoot asks the graphics firmware which monitor is connected (its EDID) and switches to the monitor's own resolution, so Linux starts on a framebuffer the monitor shows unscaled, and the graphics driver later takes it over without changing modes. The firmware logo is drawn again in the new resolution, and the menu uses it too. Only resolutions the monitor lists are used: when the firmware doesn't offer the monitor's own resolution, SushiBoot takes the largest one the monitor lists, preferring its shape, and when the firmware doesn't describe the monitor, SushiBoot keeps the resolution the firmware chose.

With Secure Boot on, SushiBoot has to be signed with a key the firmware or shim trusts. It carries an SBAT section, so shim can start it, and shim then checks everything SushiBoot starts against the same keys. SushiBoot has no command line editor, and with Secure Boot on it passes nothing but a profile number to what it starts: entries that start a kernel directly are left out, since no signature covers their command line or initramfs, and the options of other entries are dropped. On Luft, `trustctl startup install` signs it with the computer's own Luft key; see `security/README.md` for the whole startup.

## Development

```bash
make build    # release build of everything, including SushiBoot
make check    # formatting, clippy for Linux and UEFI, tests
```

### Virtual machine

The VM is a Fedora 45 system built with Podman, with greetd and Kestrel's login screen, booting through SushiBoot under QEMU and OVMF with SELinux enforcing. A small program in `scripts/vm/display` stands in for a graphics card's own firmware on the way: it describes the monitor to SushiBoot and can hand over a framebuffer of another size. The firmware framebuffer starts the boot, and a graphics driver replaces it the way one would on real hardware. The VM's udev takes half a second to finish setting up each new display device, so programs that open the device too early run into SELinux the way they would on a slow machine. Nothing on the host is installed or changed, and no step needs `sudo`.

```bash
scripts/vm/tree.sh       # Fedora root tree (first run downloads packages)
scripts/vm/kestrel.sh    # build Kestrel into the tree
scripts/vm/security.sh   # build Luft's device security services into the tree
scripts/vm/disk.sh       # install Sushi, build the initramfs, root disk and ESP
scripts/vm/run.sh        # boot it in a window
```

Everything lives in `vm/`; set `SUSHI_VM` to another folder to keep a second machine next to it. `LUKS=1 scripts/vm/disk.sh` encrypts the root disk (the passphrase is `sushi-vm`, as is the password of the `sushi` account). `MENU_TIMEOUT=3` shows SushiBoot's menu.

`LAYOUT=fedora scripts/vm/disk.sh` builds the disk the way Fedora's installer does instead: one GPT disk with an EFI system partition holding Fedora's shim and GRUB, `/boot` on its own ext4 partition with the kernels and boot entries, and a btrfs root partition with `root` and `home` subvolumes. The firmware finds shim on its own and adds a Fedora entry on the first start, as on a fresh install.

`run.sh` takes a few switches for the machine itself:

| Variable | Effect |
|----------|--------|
| `SECURE_BOOT=1` | OVMF with Secure Boot on and Microsoft's keys enrolled, so only signed boot loaders start |
| `TPM=2` | A software TPM 2.0 (swtpm) whose state stays in `tpm2/` next to the disk, like a TPM soldered to the board |
| `TPM=1.2` | An old TPM 1.2 instead |
| `XRES=3440 YRES=1440` | The monitor's resolution (1920×1080 by default) |
| `GPU=vga` | QEMU's standard VGA instead of virtio. Its firmware driver reads the monitor's EDID and starts at its resolution, which virtio's can't above 1920×1080. Linux's bochs driver then takes it over |
| `FRAMEBUFFER=1024x768` | Hand SushiBoot a framebuffer of this size, the way some firmware does |
| `EDID=0` | Don't describe the monitor to SushiBoot, so it keeps the framebuffer it was given, as GRUB would |

`disk.sh` takes `DRIVER` to choose how the graphics driver arrives:

| `DRIVER` | Effect |
|----------|--------|
| `initramfs` (default) | Sushi loads bochs itself in the initramfs, the way it loads NVIDIA's driver: fade to black, load, set the saved mode, fade back in. Use it with `GPU=vga` |
| `system` | Sushi loads bochs itself, but the initramfs doesn't carry it, so `sushi-drivers.service` asks for the hand-over after the switch to the installed system, as right after a kernel update before akmods built the driver |
| `udev` | udev loads the driver in the initramfs, which switches the screen off on its own, like AMD's driver with an external monitor |

`scripts/vm/record.py` boots the VM without a window, types at given times, answers prompts on the serial console, and saves every frame, which is how the hand-overs are checked frame by frame:

```bash
scripts/vm/record.py /tmp/frames --seconds 40 --type "16:sushi-vm"
GPU=vga XRES=3440 YRES=1440 FRAMEBUFFER=1024x768 EDID=0 scripts/vm/record.py /tmp/frames --seconds 20   # a stretched start
DRIVER=initramfs scripts/vm/disk.sh && GPU=vga scripts/vm/record.py /tmp/frames --seconds 20   # NVIDIA's hand-over
scripts/vm/frames.py /tmp/frames        # when the screen went black, froze, or changed resolution
scripts/vm/journal.sh -b 0 -u sushi    # the VM's journal, read from its disk after it shuts down
```

To watch an offline update, stage one in the VM's root tree, rebuild the disk, and start it from the serial console:

```bash
scripts/vm/update.sh
scripts/vm/disk.sh
scripts/vm/record.py /tmp/frames --seconds 60 \
  --serial "login: =>root" --serial "Password: =>sushi-vm" --serial "]# =>dnf5 offline reboot -y"
```

## License

MIT
