# Security

Luft's device security services.

## USB protection while locked

While the screen is locked, and at the login screen before anyone signs in, newly plugged USB devices wait. Devices that were already connected keep working. When you unlock, everything that waited is connected and Kestrel shows a notification naming what has just become available.

Keyboards, mice, and security keys are the exception, because you may need a new keyboard to type your password. A device that has a keyboard, mouse, or security key part gets only that part connected while locked; its other parts, such as storage, a network adapter, a serial port, audio, or anything vendor specific, wait for the unlock. Hubs are connected so a keyboard behind a dock still works, and the devices behind them are judged the same way. A device with no keyboard, mouse, or security key part waits entirely.

At the lock screen a keyboard can only type into the password field, much like a person sitting at the computer. The attacks this protection is for come through the other parts: a network adapter that quietly becomes the computer's route to the internet and intercepts its traffic, a disk crafted to exploit the code that reads file systems, or a gadget that pretends to be a keyboard and a network adapter at once. Connecting each part of a device separately lets the keyboard half of such a gadget work while its network half waits.

The service is `luft-usb-protection`, running as root from early boot, before the login screen starts, so devices present at boot are connected as usual. It is on by default and can be turned off in Settings; turning it off connects everything that waited straight away and returns USB to its usual behaviour. Changing it asks for an administrator's password. The choice is kept in `/var/lib/luft-usb-protection`. Stopping the service also returns USB to its usual behaviour.

### How it works

The kernel decides for each USB bus whether new devices, and new parts of devices (interfaces), are allowed in. While nobody is signed in and unlocked, the service sets `authorized_default` and `interface_authorized_default` to 0 on every bus, including buses that appear later, such as a dock's. The kernel still reads a waiting device's descriptors, so the service looks at the interface classes in `descriptors` when the device appears. If one of them is a keyboard, mouse, or security key (HID, class 3) or a hub (class 9), it authorizes the device and then just those interfaces, asking the kernel to bind their drivers. Everything else stays unauthorized and no driver ever touches it.

Locked or not comes from logind: the service follows seat0's active session and treats it as unlocked when it is a user session whose `LockedHint` is off. The greeter and lock screen sessions, or no session at all, count as locked. Changes are picked up from logind's signals the moment they happen, and new devices from the kernel's uevents, so nothing is polled.

On unlock the bus defaults go back to the kernel's own policy (the `usbcore.authorized_default` parameter), every waiting device and interface is authorized, and the `Released` signal lists them by name.

The kernel's own switches are used rather than USBGuard. USBGuard is built around allow lists of known devices, which is not what this needs: the decision here depends only on whether the computer is locked right now. Using the kernel directly means no extra daemon or policy file, no rules to keep in sync with the lock state, and no cost at all for devices plugged in while you are using the computer, because the kernel handles them exactly as it would without the service. The two are not meant to run side by side.

### D-Bus

`com.lantharos.UsbProtection1` on the system bus, described in `data/usb/com.lantharos.UsbProtection1.xml`:

- `Enabled`: whether new devices wait while locked.
- `Guarding`: whether new devices are waiting right now.
- `Held`: the devices waiting so far, as (id, name), the id being the kernel's name such as `3-2`.
- `SetEnabled(b)`: turns the protection on or off; requires `com.lantharos.usb-protection.configure`.
- `Released(a(ss))`: emitted on unlock with the devices that are now connected.
- `TakeReleased() -> a(ss)`: returns the devices connected by the last unlock and forgets them, so a session that starts after signing in can still announce them once. Only the person whose session is active on seat0 may take them, and the list is cleared as soon as devices start waiting again.

### Installing

```bash
security/scripts/install.sh install   # build, install, and start the services
security/scripts/install.sh remove    # stop and remove them
```

`security/scripts/build.sh DESTDIR` builds and stages the files without installing them. In the Sushi VM, `boot/sushi/scripts/vm/security.sh` puts them in the VM's root tree before `disk.sh`.
