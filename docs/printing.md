# Printing

How printers set themselves up and how Settings and the print dialog reach them. What people see is in [Printing](https://docs.luft.computer/desktop/printing/).

CUPS does the printing. Nothing talks to it but [luft-cups](../packages/system/cups), a small IPP client for its local socket that names every request's sender with CUPS's `PeerCred` scheme, so CUPS checks the caller's own account.

## Who does what

| Part | Runs as | Does |
| --- | --- | --- |
| `kestrel-settings`, module `printers` | The person signed in | `com.lantharos.Settings.Printing` on the session bus: printers, jobs, printing, test pages, the person's default printer in `~/.cups/lpoptions`, and `Changed` when CUPS reports a change. Finds driverless printers through Avahi and keeps CUPS's temporary queues for them. Notifies about jobs and printer problems |
| `luft-printers` | root, started over D-Bus | `com.lantharos.Printers1` on the system bus: devices, drivers, and adding, configuring and removing queues, behind the polkit action `com.lantharos.printers.manage` (allowed for the person at the computer, an administrator's password otherwise) |
| `luft-printer-setup.service` | root, started by udev | Sets up USB printers without IPP over USB |
| `ipp-usb` | root, started by udev | Serves printers with IPP over USB (interface class 7/1/4) on a local port and announces them through Avahi, so they work like network printers |

Settings' Printers page reads from `kestrel-settings` and changes things through `luft-printers`. The print dialog behind the print portal lists the same printers and offers to open Settings → Printers when there are none.

## Printers on the network and over IPP over USB

`kestrel-settings` browses `_ipp._tcp` through Avahi. Each service whose TXT record says it prints without a driver (`URF`, or `pdl` with `image/urf`, `image/pwg-raster` or `application/pdf`) gets a CUPS temporary queue through `CUPS-Create-Local-Printer`, named after the service as CUPS names them (`Canon_MX490_series_6` for `Canon MX490 series-6`), with an `ipp://` device URI made of the announced host name, port and `rp` (CUPS refuses `dnssd://` URIs for temporary queues). The queue is created again every two minutes while the printer is announced. CUPS removes a temporary queue five minutes after it was last used and when it stops, so a printer that goes away leaves nothing behind. These are the queues `lpstat -e` shows, and the same ones libcups' own `cupsEnumDests` finds, so apps that use libcups see them too.

Adding such a printer in Settings, or changing one of its defaults, makes the queue permanent (`printer-is-temporary` false in `CUPS-Add-Modify-Printer`). Network printers found by CUPS's own `dnssd` backend get the same name, so `com.lantharos.Printers1` knows them as set up and Settings doesn't offer them twice. Printers added by address get CUPS's `everywhere` driver, which CUPS builds from the printer's own attributes.

The firewall lets mDNS in from home networks only ([security](security.md)), so printers are found there and not on public networks. A printer gets its queue by itself only when it is announced on a home network or by this computer (IPP over USB). Which networks are home is the firewall's word (`HomeInterfaces` on `com.lantharos.Firewall1`), so discovery and the firewall never disagree. One that shows up anywhere else, such as on a network you haven't called home or one a virtual machine or container made, is only listed: `Available` on `com.lantharos.Settings.Printing` returns its name, description and location, and `AddAvailable` sets it up once you choose it. Printing itself is a connection the computer makes, which the firewall always lets through, and IPP over USB stays on the loopback interface.

## USB printers that need a driver

`60-luft-printers.rules` starts `luft-printer-setup.service` when an allowed USB device with a printer interface (7/1/1 to 7/1/3, not IPP over USB) is added. A printer plugged in while USB protection holds new devices (locked, or at the login screen) is announced again once it's let in after the unlock, and set up then. The service first asks CUPS only for USB devices, which takes a moment, and stops there when they all have queues. For each USB printer without a queue, `luft-printers usb` then:

1. Skips it when a DNS-SD printer, from CUPS's `dnssd` backend within five seconds, has the same make and model (from its TXT `usb_MFG` and `usb_MDL`), since it prints over the network without a driver. `kestrel-settings` also hides a USB queue while the same model is announced on the network, so a printer set up while it was offline doesn't show twice.
2. Asks CUPS for the drivers of the make and takes the one whose model is exactly the printer's, preferring Gutenprint's full driver over its simplified one. Without an exact match it sets nothing up; Settings offers the close ones first.
3. Adds the queue, named after the printer, enabled and accepting jobs.

## Drivers in the image

| Package | Installed | Covers | Licence |
| --- | --- | --- | --- |
| `gutenprint-cups` | about 10.4 MB with Gutenprint, its library and Python's `charset-normalizer`, leaving out Gutenprint's 22 MB of translation sources | Canon and Epson inkjets, dye-sublimation photo printers | GPL-2.0-or-later |
| `splix` | 0.2 MB | Samsung, Xerox and Dell SPL lasers | GPL-2.0-only |
| `c2esp` | 0.1 MB | Kodak ESP and Hero inkjets | GPL-2.0-or-later |
| `ptouch-driver` | 0.05 MB | Brother P-touch and QL label printers | GPL-2.0-or-later |

Left out: `hplip` (31 MB with Python dependencies; HP printers since about 2013 print without a driver, and it's a system package away), `foomatic-db-ppds` (86 MB of PPDs for printers mostly too old to matter) and `foo2zjs` (needs ArgyllCMS). Gutenprint's PPDs are generated by its CUPS driver when a queue is made, so they take no room.

## Testing

`services/printers/vm/run.sh` checks the whole path in a VM with SELinux enforcing; see [luft-printers](../services/printers/README.md). Headless Kestrel sessions run a private CUPS from `kestrel/tools/fixtures/session/printServer.sh` with two printers, ink levels and a held job, and `kestrel/tools/fixtures/system/devices/printers.ts` stands in for `com.lantharos.Printers1`.
