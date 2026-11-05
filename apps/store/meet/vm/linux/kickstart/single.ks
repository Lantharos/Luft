ignoredisk --only-use=nvme0n1
zerombr
clearpart --all --initlabel --disklabel=gpt --drives=nvme0n1
part /boot/efi --fstype=efi --size=600
part / --fstype=ext4 --grow
bootloader --timeout=1

%packages
@core
qemu-guest-agent
%end
