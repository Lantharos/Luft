Name:           luft-startup
Version:        1
Release:        1
Summary:        Luft starts through shim and SushiBoot in place of GRUB
License:        MIT
URL:            https://github.com/Lantharos/Luft
BuildArch:      noarch
Source0:        kernel-install.conf
Source1:        dnf.conf
Source2:        grubby

Requires:       shim-x64
Requires:       mokutil
Requires:       efibootmgr
Requires:       systemd-ukify
Requires:       systemd-boot-unsigned

Provides:       grub2-efi-x64 = 1:99
Provides:       grubby = 99
Obsoletes:      grub2-efi-x64 < 1:99
Obsoletes:      grubby < 99
Obsoletes:      grub2-common < 1:99
Obsoletes:      grub2-tools < 1:99
Obsoletes:      grub2-tools-efi < 1:99
Obsoletes:      grub2-tools-extra < 1:99
Obsoletes:      grub2-tools-minimal < 1:99
Obsoletes:      grub2-efi-x64-cdboot < 1:99
Obsoletes:      grub2-efi-x64-modules < 1:99
Obsoletes:      grub2-efi-ia32 < 1:99
Obsoletes:      grub2-efi-ia32-cdboot < 1:99
Obsoletes:      grub2-efi-ia32-modules < 1:99
Obsoletes:      grub2-pc < 1:99
Obsoletes:      grub2-pc-modules < 1:99
Obsoletes:      shim-ia32 < 99
Obsoletes:      dracut-config-rescue < 999

%description
Fedora's shim starts SushiBoot, signed with this computer's own Luft key, where
it used to start GRUB, and SushiBoot starts signed unified kernel images.

Shim asks for grub2-efi-x64, akmods for grubby and the NVIDIA driver for
/usr/bin/grubby, so this package stands in for them. Its grubby changes the
command line of the signed images. It keeps GRUB, the 32-bit shim and the
rescue initramfs from coming back with updates and has kernel-install leave the
signed images to trustd.

%install
install -Dm644 %{SOURCE0} %{buildroot}%{_prefix}/lib/kernel/install.conf.d/90-luft-startup.conf
install -Dm644 %{SOURCE1} %{buildroot}%{_datadir}/dnf5/libdnf.conf.d/90-luft-startup.conf
install -Dm755 %{SOURCE2} %{buildroot}%{_bindir}/grubby

%files
%{_prefix}/lib/kernel/install.conf.d/90-luft-startup.conf
%{_datadir}/dnf5/libdnf.conf.d/90-luft-startup.conf
%{_bindir}/grubby

%changelog
* Thu Oct 01 2026 Kristof Imeri <imeri@lanth.me> - 1-1
- Start through SushiBoot in place of GRUB
