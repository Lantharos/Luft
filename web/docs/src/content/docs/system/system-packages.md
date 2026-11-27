---
title: System packages
description: Add command-line tools, services, device rules and vendors' apps to the system from Fedora or a software source, without changing the sealed image.
sidebar:
  order: 3.5
asks:
  - docker
  - tailscale
  - 1password
  - virtual machine
  - virt-manager
  - libvirt
  - install a service
  - { ask: install rpm, shared: true }
  - { ask: password to install, to: passwords }
  - { ask: add repository, to: software-sources }
  - { ask: copr, to: software-sources }
  - { ask: install vscode, to: software-sources }
  - { ask: install google chrome, to: software-sources }
  - { ask: third party repo, to: software-sources }
---

Everything Schelf installs from Fedora goes into the system as a system package: command-line tools such as `htop` or `gh`, services that start with the computer, such as Tailscale, Docker or libvirt, udev rules for devices, and apps their vendors only ship as system packages, such as 1Password. They come from Fedora or from [software sources you add](#software-sources), and are there for everyone on the computer.

```sh
schelf install htop
schelf install tailscale
schelf list
schelf remove tailscale
```

`dnf install` installs only from Fedora and your software sources, several packages in one go, and takes a command's name for the package that brings it. For virtual machines with [virt-manager](https://flathub.org/apps/org.virt_manager.virt-manager), add libvirt with its default network and `virsh`:

```sh
dnf install libvirt-daemon-kvm libvirt-daemon-config-network libvirt-client
```

Luft downloads the packages and what they need, checks the signature on every one against Fedora's keys or those of the source it came from, and adds them to the system without changing Luft itself, so their commands work right away and their services start now and with every start after. Schelf lists them under Installed, Packages, where they can be removed too. Opening a package's page in Schelf already starts downloading it, unless the connection is metered.

- **Apps come with what they recommend**, as on any Fedora, such as `unpaper` for cleaning up scans in gscan2pdf, and are in Gust as soon as they're installed.
- **Schelf says when an app can't start.** If an app closes right after you open it, Schelf tells you why. When it's missing a library or a program that a package has, Schelf offers to add that package.
- **Services start by themselves.** Where Fedora has a say, such as starting Docker only when it's first used, that's what happens. Otherwise the services of the packages you asked for start with the computer, while those of packages that only came along stay off until something needs them. To keep one from starting, run `sudo systemctl mask` with its name.
- **They update by themselves.** When Luft looks for updates on its [schedule](/system/updates/), at most once a day, it also brings in newer versions of your system packages and restarts their services, keeping the versions you had if that fails. Schelf lists newer versions under Updates, to bring them in sooner. A version that needs newer parts of Luft than yours has, such as a `-devel` package built against a newer library, stops being listed after one try and waits for the next version of Luft. A downloaded update of Luft gets its own build of them before you restart, and the version before keeps its copy, so going back brings its packages along.
- **One that can't be added doesn't hold back the others.** When a package isn't available for a version of Luft, or would replace part of it, the rest are still added, and Schelf shows why under Installed, Packages. It's tried again with every update.
- **Removing one leaves the system as it was.** Its services stop, and what it added goes: its settings in `/etc`, its data in `/var`, and the users and groups it made. Data is only ever deleted when you remove a package, never by an update. Removing libvirt stops and deletes its virtual machines, and removing Docker its images and containers. A service can still leave something it made on its own in a place nobody could tell was its, such as the empty `/etc/cni` Docker's containerd makes, and network changes such as Docker's bridge last until the next restart.
- **Users, groups and helpers work.** Packages that make their own group, such as Docker's `docker` or 1Password's `onepassword`, get it on the computer with the same ID their files use, and helpers that need special permissions, such as 1Password's browser integration, keep them. Apps that install into `/opt` work like on Fedora.
- **The list is yours.** `/var/lib/luft/system-packages/packages` lists the packages you asked for, one per line.

Some packages can't be system packages, and Schelf says why:

- **Drivers.** With Secure Boot, the kernel only loads drivers signed with a key the computer trusts, and they can't be signed on the computer. NVIDIA's driver comes with Luft's [NVIDIA image](/system/nvidia/).
- **SELinux policy that replaces Luft's own.** Packages may add security policy modules, such as the ones Docker CE loads, and they're rebuilt with every update like the rest, but not ones that replace a module Luft has.
- **Packages that would replace part of Luft**, such as a newer version of a library the system has. These work again after the next update of Luft.

Everything else that needs the system to be changed, such as files in `/boot` or the startup image, stays out too, and so do files in `/usr/local`, which is [yours](/system/software/#installing-into-usrlocal) to install into by hand.

## Passwords

A package that only brings programs, which run with the rights of whoever starts them, installs and goes again without a password. Luft asks for an administrator's password when a change does more than that, which it finds out from the packages themselves before anything is added:

- it comes from a software source you added, or from an `.rpm` file
- it brings or takes away a service, device rules, a program that runs with more rights than whoever starts it, a user or group, or anything else that changes what the system does as administrator, such as PAM, polkit, sudo or security policy settings

So `schelf install htop` just installs, while `schelf install tailscale` asks first. Only someone signed in at the computer itself installs without a password.

## Software sources

Vendors that publish Linux apps often keep their own package repository, such as Docker, 1Password, Google, Microsoft or a [COPR](https://copr.fedorainfracloud.org) project. Add one, and its packages install like Fedora's and update by themselves:

```sh
schelf repo add https://download.docker.com/linux/fedora/docker-ce.repo
schelf repo add copr:scottames/ghostty
schelf repo add 1password                  # also docker, google-chrome, vscode
dnf install docker-ce docker-ce-cli containerd.io
schelf repo list
schelf repo remove docker-ce
```

In Schelf, they're under Installed, Packages, **Software sources**.

Before a source is added, Schelf shows its name, its address and the key its packages are signed with, and asks you to confirm, then for an administrator's password. A package file that isn't signed by Fedora or by a source you added, and comes without a source of its own, asks you to confirm too, since nobody vouches for it. Only add sources you trust: their packages become part of the system, with full access to the computer. Luft keeps the key it showed you and checks that source's packages against it alone, so packages signed with any other key are refused, and one source's key can't sign for Fedora's packages or another source's. A source has to sign its packages and be reached over HTTPS. That leaves out Stripe's repository, which doesn't sign its packages. The Stripe CLI installs from its `.rpm` file instead: open it, or run `schelf install ./stripe.rpm`.

Removing a source removes the packages you installed from it, with everything they added. `dnf repolist` and `dnf info` see your sources too.

Opening an `.rpm` file, such as 1Password's, Chrome's or ChatGPT's, installs it as a system package. When it comes with its vendor's repository, Schelf shows that repository and its key first, adds it, and installs the package from it, so it keeps getting updates. An `.rpm` without a repository is kept and installed again with every update of Luft, but only changes when you install a newer file.

[How system packages work](/developers/system/system-packages/) explains how they're built, checked and removed.
