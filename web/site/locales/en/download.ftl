## The download page, and the download buttons on the home page

# Browser tab title
download-title = Download Luft
download-description = Try or install Luft from Windows or Linux with Meet Luft, or download the ISO for a USB stick.
download-heading = Get Luft
download-lede = Free, for any 64-bit PC. Start from the system you have, or from a USB stick.
# Keep the <a href="{ $docs }"> and </a> around the words that link to the documentation.
download-docs = Installing, encryption and starting over are covered in <a href="{ $docs }">the docs</a>.

# Buttons. The part in <span> is hidden on small screens, so the rest must make sense alone.
download-meet-for-windows = Download Meet Luft <span>for Windows</span>
download-meet-for-linux = Download Meet Luft <span>for Linux</span>
download-iso = Download ISO

download-meet-text = The easiest way in. It checks your computer, makes room and restarts into Luft, to try it or install it. No USB stick, and nothing changes until you say so.
download-meet-windows = Download for Windows
download-meet-linux = Download for Linux
download-meet-windows-version = Windows version
download-meet-linux-version = Linux version
download-meet-windows-checksum = Windows checksum
download-meet-linux-checksum = Linux checksum
# "More info" and "Run anyway" are the buttons of Windows' SmartScreen warning; use the names Windows shows in this language.
download-meet-note = Windows 10 or 11, or Linux with a UEFI computer. Windows may ask once before opening it the first time: choose More info, then Run anyway.

download-iso-text = For a USB stick, a virtual machine, or a computer that starts from nothing. It installs offline, on any PC.
# Links to the file that proves the ISO downloaded correctly
download-checksum = checksum
# Link to the file that proves the checksum was signed by Luft
download-signature = signature
# Keep the <a href="{ $nightly }"> and </a> around the words that link to the nightly ISO.
download-nightly = Testing something new? <a href="{ $nightly }">The nightly ISO</a> is built whenever Luft changes, and computers installed from it keep getting nightly updates.

download-needs-heading = What it needs
download-needs-text = Most PCs from the last decade are fine.
download-needs-processor = Processor
download-needs-processor-value = 64-bit Intel or AMD
download-needs-firmware = Firmware
download-needs-firmware-value = UEFI. Secure Boot can stay on
download-needs-space = Space
download-needs-space-value = 32 GB or more
download-needs-graphics = Graphics
download-needs-graphics-value = Intel, AMD or NVIDIA, with NVIDIA’s own driver when it’s there
download-needs-security-chip = Security chip
download-needs-security-chip-value = TPM 2.0, optional. It unlocks an encrypted disk by itself
download-needs-usb = USB stick
download-needs-usb-value = 4 GB or more, if you use one

download-usb-heading = With a USB stick
download-usb-write = Write the ISO with Meet Luft, Fedora Media Writer, balenaEtcher or Rufus in DD mode. A Ventoy stick works too: copy the ISO onto it.
download-usb-start = Start the computer from the stick with its boot menu, usually F12, F11 or Esc while the logo shows. It opens Install Luft, which can put Luft next to Windows, on a whole drive, in place of another Linux, or just let you try it.
# Keep both <code>…</code> parts as they are; they are commands.
download-usb-check = To check a download, keep its checksum file next to it and run <code>sha256sum -c</code> with the checksum file on Linux, or compare it with <code>Get-FileHash</code> on Windows.
