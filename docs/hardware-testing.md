# Testing on real hardware

What to try when Luft goes on a new computer. Use the newest nightly ISO, named in [nightly/latest.json](https://get.luft.computer/nightly/latest.json), or the ISO from [the download page](https://luft.computer/download#iso). Write down the computer's model, its graphics, and whether Windows is on it.

## Installing

- [ ] **Secure Boot enrollment.** Leave Secure Boot on. After the restart, the blue screen takes the code Install Luft showed, and Luft starts. `mokutil --sb-state` says it's enabled, and `trustctl status` shows Luft's key as enrolled.
- [ ] **Alongside Windows.** Windows still starts from the firmware's boot menu, keeps its files, and Luft's startup partition sits next to Windows' EFI system partition when that one is small. With Fast Startup offered and on, it's off in Windows afterwards.
- [ ] **Graphics handover and the splash.** From the firmware logo to the login screen there's no flash, no black gap and no text, and the logo doesn't jump. Same when restarting and shutting down. In `journalctl -b -t sushid`, the splash moves to the graphics card before `Moved into /sysroot`, and on a built-in screen with AMD graphics it says the driver kept the picture. On NVIDIA, `bootc status` shows the `-nvidia` image.

## Every day

- [ ] **Sleep.** `cat /sys/power/mem_sleep` shows which modes the computer has; the one in brackets is used. Close the lid for a few minutes and open it again, in s2idle and, when it's listed, in deep (`echo deep | sudo tee /sys/power/mem_sleep`). The battery should barely drop overnight.
- [ ] **Suspend and resume screen.** Waking up shows the lock screen straight away, on every connected display, without the desktop showing first.
- [ ] **Sound.** Speakers, headphones, the microphone and HDMI or DisplayPort audio. Then start Windows, shut it down normally (with Fast Startup on), start Luft and check again.
- [ ] **Wi-Fi and Bluetooth.** Connect, sleep, wake and reconnect. Devices paired in Windows before installing connect in Luft without pairing again, and so do ones brought over later from Settings.
- [ ] **Touchpad and fingerprint.** Tap to click, two-finger scrolling and gestures work. When there's a reader, add a finger in Settings, Accounts, and unlock with it.
- [ ] **Display scaling.** The picked scale looks right on the built-in screen and on an external monitor, and nothing is blurry after changing it.
- [ ] **Brightness keys and battery.** The keys change brightness and show the indicator. The battery percentage and time left look plausible, and charging is noticed when plugging in.
- [ ] **Video playback.** A 4K H.264, HEVC and AV1 video plays smoothly in the browser and in the video player. `vainfo` lists the codecs; while playing, the processor stays mostly idle.
- [ ] **Anti-cheat readiness.** Settings, Security says "Ready for games with anti-cheat", and `trustctl anti-cheat` passes every requirement. If not, note the first one missing.

## Updates and unlock

- [ ] **Updates and rollback.** Settings finds an update, downloads it and restarts to install it. `bootc status` shows the new version. Then go back with Settings or `sudo bootc rollback`, and once more from SushiBoot's Previous versions menu (hold a key while starting).
- [ ] **NVIDIA driver switch.** On a computer with an NVIDIA card installed with the standard image, for example with `sudo bootc switch ghcr.io/lantharos/luft:1-nightly`, a notification after signing in offers NVIDIA's driver. Switch in Settings, System, and restart. `bootc status` shows the `-nvidia` image, `nvidia-smi` sees the card with Secure Boot on, and going back with Settings starts the standard image again.
- [ ] **TPM unlock.** Turn on encryption in Settings, Security. After it finishes, restarts open the disk without a passphrase, also after an update. Keep the recovery key; turning Secure Boot off should make Luft ask for it.

## When something fails

Note what you did, what you expected and what happened, with a photo if it's on screen before the desktop. Then collect, right after it happens:

| Command | Shows |
| --- | --- |
| `journalctl -b > boot.log` | Everything since this start |
| `journalctl -b -1 > previous-boot.log` | The start before, for crashes, freezes and failed resumes (restart first) |
| `trustctl status` | Secure Boot, keys, the TPM and encryption |
| `trustctl anti-cheat` | Each anti-cheat requirement |
| `bootc status` | The installed versions and which one is running |
| `sudo dmesg > kernel.log` | Kernel messages, for graphics, sleep and devices |
| `lspci -nnk` and `lsusb` | The hardware and the drivers it uses |
| `cat /sys/power/mem_sleep` | The sleep modes |
| `vainfo` | Video decoding |
| `vulkaninfo --summary` and `eglinfo -B` | The graphics drivers apps draw with |
| `wpctl status` | Sound devices |

For problems in one app, `journalctl -b --user` has the session's own messages.

### No sound from the jacks

When headphones or speakers stay silent but work in Windows, download [`os/tools/audio/try-hda-fixups.sh`](../os/tools/audio/try-hda-fixups.sh) and run `bash try-hda-fixups.sh`. It asks for your password, tries a few known fixes for Realtek sound chips one after another, asks whether you heard a tone after each, and puts everything back at the end. Send the `hda-fixups.txt` it leaves in your home folder.

If Windows is on the same computer, a dump from there shows how its driver sets up the chip. In Windows, plug the headphones in, open PowerShell as administrator and run:

```powershell
cd $env:USERPROFILE\Desktop; iwr https://github.com/ChimeraOS/reverse-engineering-tools/raw/main/RtHDDump_V236.zip -OutFile RtHDDump.zip; Expand-Archive RtHDDump.zip RtHDDump -Force; cd RtHDDump; & (Get-ChildItem -Recurse RtHDDump.exe)[0].FullName; Get-ChildItem -Recurse RtHDDump.txt
```

Send the `RtHDDump.txt` it lists.

A fix that works becomes part of Luft in `os/image/files/usr/lib/firmware/luft/hda-boards.fw`, as a `[codec]` section with the chip's vendor and subsystem ids, so it only applies to that board.
