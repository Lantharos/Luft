# Installing Luft

How Luft gets from the USB stick onto a computer, and what happens the first time it starts. The pieces are the [Install Luft](../apps/setup/README.md) app, its `luft-installer` service and Kestrel's setup mode.

## From the USB stick

Download the latest `luft-VERSION.iso` and write it to a USB stick of 4 GB or more with Fedora Media Writer, balenaEtcher or Rufus (in DD mode). Start the computer from the stick with the firmware's boot menu, usually F12, F11 or Esc while the logo shows. Secure Boot can stay on.

The stick starts straight into Install Luft, over the blurred wallpaper. Holding Esc while it starts shows a menu with a basic graphics mode for screens that stay dark.

1. **Language, keyboard and time zone.** Guessed from the firmware's language, from Windows if it's on the computer, and from the network once you're online. The keyboard you pick works right away, so you can try it before typing a password.
2. **Where Luft goes.**
   - *Alongside Windows* makes Windows' partition smaller and puts Luft in the room it frees. Drag the bar to choose how much each gets; Windows keeps its files and at least 20 GB to grow.
   - *Use a whole drive* erases one drive.
   - *Just try Luft* goes to the desktop on the stick and changes nothing.
   - *Custom* opens Disks, where you can make free space your own way, then pick it.
3. **Wi-Fi**, optional. Luft is already copying by now.
4. **Your account.** Name, user name and password.
5. **Restart.** Take out the stick once the screen goes dark.

Copying starts as soon as you confirm where Luft goes. Nothing changes on any drive before that.

### When Windows can't be made smaller

| What you see | What to do |
| --- | --- |
| Windows is locked with BitLocker | Turn off device encryption in Windows, or shrink its drive in Disk Management and choose the free space under Custom |
| Windows is asleep or shut down with Fast Startup | Start Windows, hold Shift while choosing Shut down, then start from the stick again |
| Windows' drive needs a check | Restart Windows once |
| Windows needs almost all of its drive | Free up space in Windows |

Luft also suggests turning off Fast Startup in Windows: Power Options, Choose what the power buttons do. Otherwise Windows can keep its drive locked while you use Luft.

## What goes on the drive

| Partition | Size | Holds |
| --- | --- | --- |
| BIOS boot | 1 MB | Room the boot loader needs on computers that start the old way |
| EFI system partition | 1 GB | The boot loader and signed startup images. Next to Windows, Windows' own is shared when it has 512 MB or more |
| Boot | 2 GB, ext4 | Kernels for each version of Luft |
| Luft | The rest, btrfs | The system and your files |

The system is a bootc image from `ghcr.io/lantharos/luft`, or the `-nvidia` variant when the computer has an NVIDIA graphics card. It updates from there.

## The first start

Luft signs you in once by itself and opens Install Luft again for the last steps.

1. **Secure Boot**, when it's on. Your computer only starts what it trusts, so it asks once whether to trust Luft, on a blue screen right after a restart. Install Luft shows that screen ahead of time and gives you an eight-digit code. After restarting: press a key within ten seconds, choose *Enroll MOK*, *Continue*, *Yes*, type the code and choose *Reboot*. Details are in [Boot and recovery](boot.md#adding-the-luft-secure-boot-key).
2. **Encryption**, optional. Luft encrypts the disk in the background after the next restart. With a TPM it unlocks by itself; without one it asks for a passphrase. Keep the recovery key it shows somewhere else.
3. **Done.** The desktop opens, or the computer restarts when one of the steps needs it. From then on Luft starts at the login screen.

Both steps can be skipped and done later in Settings, under Security.

## For image builders

`/usr/lib/luft-installer/install.toml` says what to install:

```toml
first-boot-session = "/usr/bin/kestrel-session --setup"
# bootloader = "none"                 # passed to bootc install --bootloader
# kernel-arguments = ["quiet"]
# smallest-system = 34359738368       # bytes; drives or spaces below it aren't offered

[images.default]
source = "containers-storage:ghcr.io/lantharos/luft:45"   # where the stick has the image
size = 5286520084                                         # bytes installed, for the progress bar
```

The image ships only the settings above the `[images]` tables. The stick's build adds a table for each image it carries, with the size Podman reports for it. `[images.nvidia]` is used on computers with an NVIDIA graphics card. Updates come from the reference in `/usr/share/luft/image-reference`, with `-nvidia` added for the NVIDIA image.

- The stick ([os/iso](../os/iso)) keeps both images in a read-only image store on the stick, which the session there adds to Podman's storage, so `containers-storage:` sources install without a network.
- Its kernel command line has `rd.live.image`, which tells the installer it's on the stick. greetd signs the passwordless `live` account in with `kestrel-session --setup` as its `initial_session`, and polkit allows that account everything, installing included.
- After copying, the installer writes the locale, keyboard, time zone, host name and the account into the new system, and sets greetd's `initial_session` so the first start opens setup. `FinishFirstBoot` takes it out again.

`kestrel-session --setup` runs Kestrel in setup mode until Install Luft finishes, then starts the normal session. Setup mode shows the firmware logo while Sushi hands over, fades in the blurred wallpaper with the window, and ends on that same wallpaper, so the desktop takes over without a flash.
