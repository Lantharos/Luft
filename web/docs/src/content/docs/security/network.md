---
title: Network
description: What Luft sends and answers on a network, how the firewall decides who may connect, and how remote login is kept closed.
sidebar:
  order: 5
---

Luft shows itself to other devices only on networks someone called home, and lets them reach only what someone chose to share. What people see of this is on [Security](/system/security/#home-and-public-networks).

## What the computer says

- NetworkManager checks for a working connection, or a sign-in page, by fetching `http://luft.computer/connectivity` every five minutes. The address answers `online` to everyone and sets no cookie.
- Wi-Fi scans use a random hardware address, and each network sees an address of its own, the same every time, so the computer can't be followed from one network to the next by it. IPv6 connections use temporary addresses.
- Luft doesn't answer LLMNR, where anyone on the network could answer a lookup and pose as another computer to catch sign-ins. Names still resolve through mDNS, `name.local`, which Avahi answers.
- Weather for extensions and Start's currency rates come from Luft's own site, `luft.computer/api/weather` and `luft.computer/api/rates`, which pass the question on, so the weather service never sees the computer. Weather requests carry only the position rounded to a tenth of a degree, about ten kilometres, and the site shares one answer between everyone in the same square. Rates take no parameters. Turning off **Weather and currency rates** under Privacy stops both.

## The firewall

Every Wi-Fi and wired network is home or public, kept with its NetworkManager profile as `connection.zone`, so the choice moves with the profile. A network nobody chose for is public until someone does.

The firewall is one nftables table, `inet luft`, whose input chain drops what it doesn't allow. Its rules never change: `luft-firewall-base.service` loads them from `/usr/share/luft-firewall/base.nft` before any network comes up, and they refer to sets that start out empty. So from the first moment only replies, loopback, the ICMP messages IPv4 and IPv6 need and DHCP get in, and that stays true if `luft-firewall` can't start or stops. `luft-firewall` only fills the sets, swapping just the ones that changed in one transaction whenever a network, an app's listening socket or a choice changes.

| From | Gets in |
| --- | --- |
| Every network | Replies, loopback, required ICMP, DHCP |
| Home networks, from their own address ranges | Ping, mDNS, SSDP and WS-Discovery, apps allowed at home, Post while it may be found, extensions' ports, ports opened in Settings |
| Tailscale | What a home network gets |
| Virtual networks the computer hosts (libvirt, Podman, Waydroid, Docker) and its hotspot | DNS, DHCP and router solicitations they need, and what a home network gets |
| Public networks | Only apps allowed everywhere, and ports opened everywhere |

Public networks get no ping and no discovery: answering would tell everyone in a café the computer's name and what it offers. A connection forwarded by a router from outside isn't a device on the network, and only reaches what's open everywhere. The forward and NAT chains of libvirt, Podman and NetworkManager are left alone.

### Apps

The firewall knows which app every listening socket belongs to. Every app runs in a systemd unit of its own under `app.slice`, and its app ID comes from the unit's name: `app-flatpak-ID-N.scope`, `app-kestrel-ID-PID.scope` and their like. A process in any other unit there, such as a shell Tern opened or a `systemd-run` command, is a program, known by the first word of its command line, such as `python3`. Luft's own session services, system services and login sessions are never asked about.

Cgroup BPF programs tell the firewall the moment a socket is bound to a fixed port on an address other than loopback, once the bind worked, when it connects somewhere and so stops listening, and when it closes. They run only on those calls, never for a packet. In the kernel, packets are matched against sets of the app unit's cgroup, protocol and port, so another program in the same unit stays out until it's allowed too.

Once an app has listened for two seconds while a home network, Tailscale or a virtual network is there, Kestrel asks the person running it whether other devices may connect, with Don't allow picked. Sockets that close sooner, such as a program checking whether a port is free, never ask. The answer is about the app, holds for every socket it opens later, and is kept for that person and that app in `/var/lib/luft-firewall/apps`, so one person's answer never opens another's apps. Apps that only listen for discovery aren't asked, since those ports are open at home anyway.

Allowing an app at home, or making a network home, asks for the person's password or fingerprint; allowing an app everywhere needs an administrator; anything stricter never asks. Each approval covers only the change its prompt named. App identities come from unit names and command lines, which a program running as the person could imitate to pass as an app already allowed. The firewall keeps devices on the network away from what nobody chose to share; it isn't a sandbox between programs on the computer. Flatpaks have no system bus and can't change it at all.

### Post, extensions and services

Post, Kestrel's way of sending files to devices nearby, uses LocalSend's port 53317. The port is part of the firewall's rules, and opens on home networks only while `kestrel-post` says with `SetPostOpen` that someone may find the computer. The firewall takes that only from Post running from the image in its own `kestrel-post.service`, as [Who an app is](/security/identity/#telling-them-apart) describes.

Post itself only looks for devices and announces itself on the interfaces `HomeInterfaces` on `com.lantharos.Firewall1` lists, and leaves a network the moment it turns public. While only your devices may find the computer, it never announces itself and answers only devices whose TLS client certificate is one of yours; while no one may, it serves nothing and finds devices to send to by asking each address on the local `/24`, which reveals nothing about this computer. Pairing in Settings asks a new device for the six-digit PIN Settings shows, three tries per address. [Post](/desktop/post/) covers using it.

Extensions that listen name their ports in `extension.toml`, and people agree to them at install. Kestrel hands the firewall the ports of the running extensions with `SetExtensionPorts`, which the firewall takes only from Kestrel, opens for `kestrel.service` alone and on home networks only. The first time a person's Kestrel names a port, the person confirms it, and the answer is kept in `/var/lib/luft-firewall/extension-ports`.

Services that run without an app, such as a web server, are never asked about. Settings opens a port for them on home networks, which needs an administrator. A port open on every network is only for [remote login](#remote-login), and needs an administrator each time.

`HomeInterfaces` is the one place that decides which interfaces are at home, for everything that should only look for devices or show itself there. Printer discovery follows it: `kestrel-settings` sets up by itself only driverless printers announced on a home interface or over IPP over USB, which stays on loopback. A printer seen anywhere else, such as on a network a virtual machine made, is only listed until someone chooses it. Printing is a connection the computer makes, so the firewall never stands in its way.

## Remote login

Remote login is off on a new computer, and off means nothing waits for SSH at all: `sshd.service` and `sshd.socket` aren't running or wanted, and the image turns off `systemd-ssh-generator`, which would otherwise make sshd reachable over AF_VSOCK and a local socket.

`luft-remote-login` keeps the choices in `/var/lib/luft-remote-login/choices`: whether it's on, whether passwords are allowed, and which accounts may sign in. Living in `/var`, they're the same for every version of the system on the computer, so going back to an older one can't turn SSH back on. At every start, and whenever the choices change, `luft-remote-login-generator` decides whether sshd runs. When remote login is off, or the choices can't be read, it masks `sshd.service` from `/run/systemd/generator.early`, which comes before `/etc`, so even an old `/etc` that asks for sshd can't start it. It always masks `sshd.socket` and `sshd@.service`.

Luft's defaults, `/etc/ssh/sshd_config.d/05-luft.conf`, come before Fedora's files, and sshd keeps the first value it reads, so they win while the crypto policy still picks the algorithms:

- keys only, no passwords, keyboard-interactive or GSSAPI, no RSA keys under 2048 bits, no root;
- 4 tries and 30 seconds to sign in, new connections turned away once 10 are still signing in;
- no X11 forwarding, and connections that stop answering are ended after 3 minutes;
- per-source penalties: an address that keeps failing is refused, even with the right key, for up to an hour.

Who may sign in, and whether passwords are allowed, reach sshd through `/run/luft-remote-login/sshd.conf`, which `05-luft.conf` includes first and which is written from the choices whenever sshd starts or they change. With nobody allowed it says `DenyUsers *`. Turning anything on needs an administrator after a warning; turning things off doesn't.

Keys are each account's own `~/.ssh/authorized_keys`. The service, which runs as root with only `CAP_SETUID` and `CAP_SETGID` and no network, edits that file on a thread switched to the caller's user and groups, so it can't touch anything the account couldn't. Only public keys are taken, checked by decoding them. Every SSH sign-in is announced as an urgent notification in every signed-in session, lock screen included. sshd itself is Fedora's.

## Cloud drive sign-ins

A password typed in Settings for a cloud drive reaches `luft-accounts` through a pipe handed over with `SignIn`, never in the message, so nothing watching the session bus sees it. Nextcloud and WebDAV servers have to use `https`; plain `http` is only taken for a server on the same computer. The service drives rclone over a socket that asks every request for a password made up at each start, so nothing else that finds the socket can drive it.

Freeing a file's space or removing an account first sends up what changed on this computer. When that can't be done, `Free` deletes nothing, and neither does `Remove` until the person confirmed losing those files.
