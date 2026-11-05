text
url --url=https://dl.fedoraproject.org/pub/fedora/linux/development/45/Everything/x86_64/os/
lang en_US.UTF-8
keyboard us
timezone Europe/Berlin --utc
network --bootproto=dhcp --hostname=ada-fedora
rootpw --plaintext meet-vm
user --name=ada --gecos="Ada Lovelace" --groups=wheel --password=meet-vm --plaintext
selinux --enforcing
firstboot --disable
services --enabled=qemu-guest-agent,sshd
poweroff

%post
echo "(typepermissive virt_qemu_ga_t)" > /root/ga.cil
semodule -i /root/ga.cil
%end
