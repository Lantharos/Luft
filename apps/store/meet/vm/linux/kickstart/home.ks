ignoredisk --only-use=nvme0n1
zerombr
clearpart --all --initlabel --disklabel=gpt --drives=nvme0n1
part /boot/efi --fstype=efi --size=600
part /boot --fstype=ext4 --size=1024
part / --fstype=ext4 --size=16384
part /home --fstype=ext4 --grow
bootloader --timeout=1

%packages
@core
qemu-guest-agent
%end
