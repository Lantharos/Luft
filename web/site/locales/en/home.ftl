## The home page of luft.computer

# Shown under the big "Luft" and in search results
home-description = A calm, quick desktop for your PC. Try it from Windows or Linux with one restart, no USB stick needed.
home-get = Get Luft
# Scrolls down to the screenshots
home-look = Take a look

home-desktop-alt = The Luft desktop with Rover, Settings and Tern open over a misty forest
home-intro = Luft is a complete system for your PC, built on Fedora. It has its own desktop, its own apps and a core that keeps itself in one piece, so you can get on with your day.

home-start-heading = Start knows where everything is.
home-start-text = Type a few letters and Start finds apps, settings, files and even the words inside them. It does sums and unit conversions, and turns on dark style or Wi-Fi when you ask.
home-start-alt = Start searching for dark, with the dark style action and matching settings

home-essentials-heading = The essentials, one click away.
home-essentials-text = Quick settings are tiles you arrange yourself. Notifications group by app, with replies, media controls and a calendar right next to them.
home-quick-settings-alt = Quick settings with network, power mode, dark style and volume
home-notifications-alt = The notification center with a calendar

home-windows-heading = Room for every window.
home-windows-text = Snap windows into layouts or see them all at once. Or turn any desktop into a board, an endless canvas where windows sit side by side and you zoom out to see the whole picture.
home-board-alt = A desktop as a board, with every window side by side
home-snap-alt = Snap layouts for the focused window
home-all-windows-alt = Every window and desktop at a glance

home-motion-heading = It moves like it means it.
home-motion-text = Everything in Luft moves on springs, so it can change its mind halfway without a jolt. Swipes follow your fingers and land where you meant, and apps open quickly, even the first time.
home-motion-clip = Start, quick settings, every window at a glance and the board, opening and closing in Luft

home-wallpapers-heading = Pick a photo. Luft does the rest.
home-wallpapers-text = { $count ->
    [one] One photograph comes with it. Choose it, and the accent, the glass and every app take on its colours, in light and dark.
   *[other] { $count } photographs come with it. Choose one, and the accent, the glass and every app take on its colours, in light and dark.
}
# { $name } is the wallpaper's name in Luft, such as Fog; { $photographer } is a person's name.
home-wallpaper = { $name }, a photo by { $photographer }

home-apps-heading = Apps made for it, from day one.
home-apps-text = Luft comes with its own apps. They share the desktop’s glass, colours and motion, open in a blink and stay out of your way.
# Accessible name of the list of app tabs
home-apps-label = Luft’s apps
# Description of an app's screenshot. { $app } is its name, { $kind } what it is, such as "Files".
home-app-shot = { $app } ({ $kind })
home-app-settings-name = Settings
home-app-disks-name = Disks
# What each app is, shown under its name
home-app-rover = Files
home-app-rover-detail = Tabs, Quick Look, network drives and your cloud drives, with a sidebar that knows where Windows lives.
home-app-settings = Settings
home-app-settings-detail = Every switch in one place, from Wi-Fi and displays to updates, security and the taskbar.
home-app-magpie = Photos, videos and music
home-app-magpie-detail = Opens photos, videos, songs, PDFs and fonts, with the rest of the folder an arrow key away.
home-app-mailman = Mail
home-app-mailman-detail = One inbox for every account, a screener for new senders and search that works offline.
home-app-draft = Text and code
home-app-draft-detail = Over a hundred languages, multiple cursors and a Markdown preview, and it remembers where you left off.
home-app-tern = Terminal
home-app-tern-detail = Tabs and split panes, a nudge when a long command finishes, and colours from your wallpaper.
home-app-schelf = Apps
home-app-schelf-detail = Thousands of apps from Flathub and AppImages, with permissions explained in plain words.
home-app-disks = Drives
home-app-disks-detail = Partitions to scale, encryption, health checks and USB sticks made from an image.
home-app-barometer = System monitor
home-app-barometer-detail = What every app is using, with live graphs for the processor, memory, graphics and network.
home-app-keys = Keyboard layouts
home-app-keys-detail = Draw your own keyboard layout or input method, and try it before you save it.

home-cloud-heading = Your cloud, as plain folders.
home-cloud-text = Sign in once in Settings and your files appear in Rover, and in every app’s Open dialog. Nothing downloads until you open it, and what you keep on the computer works offline.

home-security-heading = Safe by design, not by settings.
home-security-text = Everything that keeps your computer yours is on from the start, and stays out of your way.
home-security-sealed = Sealed and signed
home-security-sealed-text = The whole system is one signed image, and every file is checked against it. Nothing can quietly change underneath you.
home-security-updates = Updates that can’t break it
home-security-updates-text = Updates arrive in the background and switch over at the next restart, all at once. The version before is always one choice away.
home-security-secure-boot = Secure Boot stays on
home-security-secure-boot-text = Every step of startup is signed, from the USB stick to the desktop, so there’s nothing to turn off in the firmware.
home-security-encryption = Encrypted, without the typing
home-security-encryption-text = Turn on encryption with a click. With a TPM, the disk unlocks by itself, and only for the system that belongs to it.
home-security-passkeys = Passkeys everywhere
home-security-passkeys-text = Passkeys live on your computer and work in every browser, confirmed with your fingerprint or password.
home-security-keyring = One keyring
home-security-keyring-text = Passwords, sign-ins, SSH keys and GnuPG are kept in one place, unlocked when you sign in.

home-meet-heading = Try it tonight. No USB stick.
home-meet-text = Meet Luft gets your computer ready from the system you already use, then restarts into Luft once.
home-meet-download = Download Meet Luft
home-meet-download-text = A small app for Windows and Linux. It checks your computer first and tells you what it found, in plain words.
home-meet-room = It makes room
home-meet-room-text = On Windows it shrinks Windows with Windows’ own tools, so BitLocker is fine. On Linux it keeps Luft in a folder. Nothing else changes.
home-meet-restart = Restart into Luft
home-meet-restart-text = Try it for as long as you like, then install it next to Windows, or in place of your old Linux with your files kept. The next restart goes back to what you had.
# Keep the <a href="{ $iso }"> and </a> around the words that link to the ISO download.
home-meet-usb = Prefer a USB stick? Meet Luft makes one too, or <a href="{ $iso }">write the ISO yourself</a>.
home-meet-shot = Meet Luft, ready to try Luft, bring your things along or install it

home-questions-heading = Questions
home-question-cost = Does it cost anything?
home-question-cost-answer = No. Luft is free and open source, and so are its apps.
home-question-hardware = Will it run on my computer?
home-question-hardware-answer = If it is a 64-bit PC with UEFI from the last ten years or so, very likely. Luft needs at least 32 GB of space. A TPM is optional and lets an encrypted disk unlock by itself. Computers with NVIDIA graphics get NVIDIA’s own driver, set up while installing.
home-question-windows = Can I keep Windows?
home-question-windows-answer = Yes. Luft can live next to Windows and you choose which one starts. Meet Luft makes room with Windows’ own tools, so it works with BitLocker on, and it can take everything back out if you change your mind.
home-question-try = Can I try it before installing?
home-question-try-answer = Yes. Meet Luft restarts into Luft once, without installing anything, and the next restart is back in Windows or your Linux. A USB stick works the same way.
home-question-apps = What about my apps?
home-question-apps-answer = Schelf installs apps from Flathub and AppImages, and keeps them up to date. Helium comes as the browser and can be swapped for any other. Command-line tools go into a Toolbox container that Schelf manages too.
home-question-updates = How do updates work?
home-question-updates-answer = The whole system updates at once, in the background, and switches over at the next restart. If something isn’t right, the version before is one choice away when the computer starts.
home-question-ready = Is it ready?
# Alizé is the name of Luft's first release; keep it as it is.
home-question-ready-answer = Luft is in testing. Nightly builds come out whenever something changes, and the first release, Alizé, follows once it’s stable. Computers installed from a nightly build keep getting nightly updates.
