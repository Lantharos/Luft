ignoredisk --only-use=nvme0n1,vda
zerombr
clearpart --all --initlabel --disklabel=gpt --drives=nvme0n1,vda
part /boot/efi --fstype=efi --size=600 --ondisk=nvme0n1
part /boot --fstype=ext4 --size=2048 --ondisk=nvme0n1
part btrfs.01 --fstype=btrfs --grow --ondisk=nvme0n1
btrfs none --label=fedora btrfs.01
btrfs / --subvol --name=root LABEL=fedora
btrfs /home --subvol --name=home LABEL=fedora
part /mnt/data --fstype=ext4 --grow --ondisk=vda --label=data
bootloader --timeout=1

%packages
@^workstation-product-environment
qemu-guest-agent
%end

%post
cat > /etc/gdm/custom.conf <<'GDM'
[daemon]
AutomaticLoginEnable=True
AutomaticLogin=ada
GDM
mkdir -p /etc/dconf/db/local.d
cat > /etc/dconf/db/local.d/00-meet-vm <<'DCONF'
[org/gnome/desktop/session]
idle-delay=uint32 0
[org/gnome/desktop/screensaver]
lock-enabled=false
[org/gnome/settings-daemon/plugins/power]
sleep-inactive-ac-type='nothing'
DCONF
dconf update
systemctl set-default graphical.target
mkdir -p /home/ada/.config
touch /home/ada/.config/gnome-initial-setup-done
chown -R ada:ada /home/ada/.config
%end
