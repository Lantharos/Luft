### Network, Bluetooth and Accounts panels

## Network: shared words

# Button
settings-network-save = Save
# Button label while saving
settings-network-saving = Saving…
# Button
settings-network-cancel = Cancel
# Button that connects to a network
settings-network-connect = Connect
# Button that disconnects from a network
settings-network-disconnect = Disconnect
# Placeholder of a field that can stay empty
settings-network-optional = Optional
# A setting chosen by the computer, like an IP method or a proxy mode
settings-network-automatic = Automatic
settings-network-name = Name
settings-network-password = Password
# Placeholder of a password field when a password is already stored
settings-network-password-saved = Saved password
settings-network-username = Username
settings-network-router = Router
settings-network-dns-servers = DNS servers
settings-network-private-key = Private key
# Screen-reader label of the settings button next to a wired connection or VPN
settings-network-connection-settings = Connection settings
# A connection attempt failed; shown under the connection's name
settings-network-connect-failed = Couldn't connect

## Network: connection states

settings-network-link-connected = Connected
settings-network-link-connecting = Connecting…
settings-network-link-disconnected = Not connected
settings-network-link-unplugged = Cable unplugged

## Network: Wi‑Fi security types

# No password on the network
settings-network-security-open = None
settings-network-security-owe = Enhanced open
settings-network-security-wep = WEP
settings-network-security-psk = WPA2 Personal
settings-network-security-sae = WPA3 Personal
# Networks you sign in to with a work or school account
settings-network-security-enterprise = Enterprise

## Network: signal and radio details

settings-network-signal-excellent = Excellent
settings-network-signal-good = Good
settings-network-signal-fair = Fair
settings-network-signal-weak = Weak
# $quality is one of the signal words above, $strength the signal as a percentage, like "80%"
settings-network-signal = { $quality } ({ $strength })
# $band is the radio band in gigahertz (2.4, 5 or 6), $channel the Wi‑Fi channel number
settings-network-band = { $band } GHz · Channel { $channel }

## Network: details rows of a connection

settings-network-detail-signal = Signal
settings-network-detail-band = Band
settings-network-detail-speed = Link speed
settings-network-detail-access-point = Access point
settings-network-detail-security = Security
settings-network-detail-ipv4 = IP address
settings-network-detail-ipv6 = IPv6 address
settings-network-detail-router = Router
settings-network-detail-dns = DNS
settings-network-detail-mac = Hardware address

## Network panel

settings-network-wifi = Wi‑Fi
settings-network-wifi-hardware-off = Turned off by a hardware switch
# $network is the name of the Wi‑Fi network
settings-network-wifi-connected = Connected to { $network }
settings-network-airplane = Airplane mode
    .description = Turns off every wireless connection
settings-network-airplane-hardware = Turned on by a hardware switch
settings-network-known = Known networks
    .description = Networks this computer has joined before, nearby or not
settings-network-known-count = { $count ->
        [one] { $count } saved network
       *[other] { $count } saved networks
    }
# A known network that is nearby but not connected
settings-network-known-in-range = In range
settings-network-wired = Wired
settings-network-ethernet = Ethernet
# Used when the computer has several network cables; $name is the network card's name
settings-network-ethernet-named = Ethernet ({ $name })
# $speed is the link speed, like "1 Gb/s"
settings-network-wired-connected = Connected · { $speed }
settings-network-empty = No network connections
    .description = Plug in a network cable or a Wi‑Fi adapter to get online
settings-network-proxy = Proxy
    .description = Send web traffic through another server, often needed on work or school networks.

## Network: Wi‑Fi networks

settings-network-wifi-networks = Wi‑Fi networks
# A network this computer has joined before
settings-network-wifi-saved = Saved
settings-network-wifi-enterprise = Sign in with a work or school account
settings-network-wifi-connect-failed = Couldn't connect to this network
settings-network-wifi-saved-password-failed = The saved password didn't work. Enter it again.
# Screen-reader label of the settings button next to a Wi‑Fi network
settings-network-wifi-settings = Network settings
settings-network-wifi-searching = Looking for networks…
settings-network-hidden = Connect to a hidden network
    .description = Enter the network's name and how it's secured.
settings-network-hidden-name = Network name

## Network: joining a Wi‑Fi network

# Dialog title; $network is the Wi‑Fi network's name
settings-network-join = Connect to “{ $network }”
settings-network-join-enterprise = Sign in with your work or school account.
settings-network-join-password = Enter the password for this network.
settings-network-join-failed = Couldn't connect to this network.
settings-network-join-sign-in-failed = Couldn't sign in. Check your username and password.
settings-network-join-wrong-password = That password didn't work. Check it and try again.

## Network: connection settings page

# .button is the button that forgets the network
settings-network-forget = Forget this network
    .description = Removes its password and settings from this computer
    .button = Forget
settings-network-remove-vpn = Remove this VPN
settings-network-remove-connection = Remove this connection
settings-network-remove-description = Deletes its settings from this computer
# Button
settings-network-remove = Remove

settings-network-general = General
settings-network-autoconnect = Connect automatically
settings-network-autoconnect-wifi = Join this network whenever it’s in range
settings-network-autoconnect-wired = Connect as soon as a cable is plugged in
settings-network-autoconnect-vpn = Connect whenever this computer is online
settings-network-autoconnect-other = Connect whenever it’s available
settings-network-all-users = Available to everyone
    .description = Anyone who signs in here can use it
settings-network-metered = Metered connection
    .description = Apps and updates hold back on large downloads
settings-network-metered-automatic = Detect automatically
settings-network-metered-yes = Metered
settings-network-metered-no = Not metered

settings-network-security = Security
settings-network-security-type = Security type

settings-network-advanced = Advanced
settings-network-private-address = Private address
    .description = Makes this computer harder to track on this network
settings-network-hardware-address = Hardware address
    .description = The address this computer shows to the network
settings-network-mac-random = New address each time
settings-network-mac-stable = Same address for this network
# Private address turned off
settings-network-mac-private-off = Off
settings-network-mac-builtin = Built-in address
settings-network-mac-custom = Custom address
# .label is the screen-reader label of the field
settings-network-mtu = Largest packet size (MTU)
    .description = Leave empty unless your network needs a specific size
    .label = MTU

## Network: IPv4 and IPv6 settings
## $family is "IPv4" or "IPv6".

settings-network-ip-method = Method
    .label = { $family } method
settings-network-ip-dhcp = Automatic, addresses only
settings-network-ip-manual = Manual
settings-network-ip-link-local = Link-local only
settings-network-ip-shared = Shared with other devices
settings-network-ip-ignore = Not managed
settings-network-ip-disabled = Off
# $example is an address, like 192.168.1.20/24
settings-network-ip-addresses = Addresses
    .description = Each with its prefix, like { $example }
# Screen-reader label of an address field; $number counts the fields from 1
settings-network-ip-address = Address { $number }
settings-network-ip-remove-address = Remove address
settings-network-ip-add-address = Add address
settings-network-ip-router = { $family } router
settings-network-ip-automatic-dns = Automatic DNS
    .description = Use the DNS servers this network suggests
settings-network-ip-dns-first = Used before the suggested ones
settings-network-ip-dns-separate = Separate addresses with commas
settings-network-ip-dns-servers = { $family } DNS servers
settings-network-ip-search-domains = Search domains
    .description = Tried when a name has no domain, like “printer”
    .label = { $family } search domains
settings-network-ip-automatic-routes = Automatic routes
    .description = Use the routes this network suggests
settings-network-ip-routes = Routes
    .description = Send traffic for some networks through another router
settings-network-ip-add-route = Add route
# The destination network of a route
settings-network-route-network = Network
# The metric of a route; lower numbers win
settings-network-route-priority = Priority
settings-network-route-remove = Remove route

## Network: work or school (802.1X) sign-in

settings-network-eap = Authentication
settings-network-eap-peap = Protected EAP (PEAP)
settings-network-eap-ttls = Tunneled TLS (TTLS)
settings-network-eap-tls = Certificate (TLS)
settings-network-eap-inner = Inner authentication
settings-network-client-certificate = Your certificate
settings-network-private-key-password = Private key password
    .placeholder = If the key has one
settings-network-anonymous-identity = Anonymous identity
    .description = Leave empty unless your network asks for it
settings-network-ca = CA certificate
    .description = Confirms you’re connecting to the real network
settings-network-ca-system = Use system certificates
settings-network-ca-file = Choose a file…
settings-network-ca-another-file = Choose another file…
settings-network-ca-none = Don’t check
# Button that opens a file picker
settings-network-choose-file = Choose…
settings-network-server-domain = Server domain
    .description = Only connect to servers in this domain

## Network: form errors
## $example is an address in the right format, like 192.168.1.1.

settings-network-error-name = Enter a name
settings-network-error-no-addresses = Add at least one address
settings-network-error-address = Enter an address with its prefix, like { $example }
settings-network-error-router = Enter a router address, like { $example }
# $address is what the person typed
settings-network-error-dns = “{ $address }” isn't a valid address
# $domain is what the person typed
settings-network-error-search-domain = “{ $domain }” isn't a valid domain
settings-network-error-route = Enter a network, like { $example }
settings-network-error-priority = Use a whole number for the priority
settings-network-error-username = Enter your username
settings-network-error-domain = Enter a domain, like example.com
settings-network-error-certificate = Choose your certificate
settings-network-error-private-key = Choose your private key
settings-network-error-mtu = Use a number from { $lowest } to { $highest }, or leave it empty
settings-network-error-mac = Enter an address like 12:34:56:78:9A:BC
settings-network-error-password = Enter your password
settings-network-error-password-length = { $count ->
        [one] Use at least { $count } character
       *[other] Use at least { $count } characters
    }

## Network: proxy

settings-network-proxy-off = Off
settings-network-proxy-manual = Manual
settings-network-proxy-url = Configuration address
settings-network-proxy-http = Web (HTTP)
settings-network-proxy-https = Secure web (HTTPS)
settings-network-proxy-socks = SOCKS
# Placeholder of the server name field. .label is its screen-reader label; $protocol is one of the proxy kinds above, like "Web (HTTP)"
settings-network-proxy-server = Server
    .label = { $protocol } server
# Placeholder of the port field. .label is its screen-reader label; $protocol is one of the proxy kinds above, like "Web (HTTP)"
settings-network-proxy-port = Port
    .label = { $protocol } port
settings-network-proxy-skip = Don’t use the proxy for
settings-network-proxy-error-url = Enter a web address, like http://example.com/proxy.pac
settings-network-proxy-error-host = Enter just the server name, like proxy.example.com
settings-network-proxy-error-port = Use a port from 1 to 65535
settings-network-proxy-save-failed = Couldn't save the proxy settings

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-import = Import from a file
    .description = WireGuard, OpenVPN and other VPN configuration files
settings-network-vpn-importing = Importing…
settings-network-wireguard = Set up WireGuard
    .description = Enter the details from your VPN provider or server
settings-network-wireguard-dialog = Your VPN provider or the server’s owner can give you these details.
# Example name for a new VPN, shown as a placeholder
settings-network-wireguard-name-example = Home VPN
# $key is the public key, a long code
settings-network-wireguard-public-key = Public key { $key }
settings-network-wireguard-public-key-pending = Its public key shows up here to share
settings-network-wireguard-copy = Copy public key
settings-network-wireguard-copied = Copied
settings-network-wireguard-generate = Generate a new key
settings-network-wireguard-addresses = This computer’s addresses inside the VPN
settings-network-wireguard-server-key = Server public key
settings-network-wireguard-endpoint = Server address
settings-network-wireguard-allowed-ips = Allowed IPs
    .description = Traffic to these ranges goes through the VPN
settings-network-wireguard-preshared-key = Preshared key
settings-network-wireguard-keepalive = Keepalive
    .description = Helps the connection stay up behind a router
    .placeholder = Optional, in seconds
# Button
settings-network-wireguard-add = Add
# Button label while adding
settings-network-wireguard-adding = Adding…
settings-network-wireguard-error-private-key = Enter or generate a private key
settings-network-wireguard-error-addresses = Enter at least one address
settings-network-wireguard-error-server-key = Enter the server’s public key
settings-network-wireguard-error-endpoint = Enter the server’s address and port
settings-network-wireguard-error-allowed-ips = Enter at least one range
settings-network-wireguard-error-keepalive = Enter a number of seconds

## Bluetooth panel

# Shown under the Bluetooth switch
settings-bluetooth-hardware-off = Turned off by a hardware switch
settings-bluetooth-power-on-failed = Couldn't turn Bluetooth on
settings-bluetooth-power-off-failed = Couldn't turn Bluetooth off
settings-bluetooth-visible = Visible to nearby devices
    .description = Lets phones and computers find this one
# $name is the name this computer shows to other devices
settings-bluetooth-visible-as = Shown as “{ $name }”
# Screen-reader label of the menu that picks how long the computer stays visible
settings-bluetooth-visible-duration = Stay visible
settings-bluetooth-visible-for = { $minutes ->
        [one] For { $minutes } minute
       *[other] For { $minutes } minutes
    }
settings-bluetooth-visible-until-off = Until turned off
settings-bluetooth-visible-failed = Couldn't change whether this computer is visible
settings-bluetooth-paired = My devices
settings-bluetooth-nearby = Nearby devices
settings-bluetooth-searching = Looking for devices…
    .description = Put the device you want to add in pairing mode
settings-bluetooth-blocked = Bluetooth is turned off by a hardware switch
    .description = Use the switch or key on your computer to turn it on
# Screen-reader label of the button that opens a device's details
settings-bluetooth-details = Device details
settings-bluetooth-connected = Connected
# $battery is the device's battery level, like "80%"
settings-bluetooth-connected-battery = Connected · { $battery } battery
settings-bluetooth-connecting = Connecting…
settings-bluetooth-disconnecting = Disconnecting…
settings-bluetooth-pairing = Pairing…
# $name is the device's name
settings-bluetooth-forget-confirm = Forget “{ $name }”?
    .description = You'll need to pair it again to use it with this computer.
# Button
settings-bluetooth-forget = Forget
# Button
settings-bluetooth-cancel = Cancel
# Button
settings-bluetooth-connect = Connect
# Button
settings-bluetooth-disconnect = Disconnect
# Button that closes the device details
settings-bluetooth-done = Done

## Bluetooth: device details

settings-bluetooth-type = Type
settings-bluetooth-battery = Battery
settings-bluetooth-address = Address
settings-bluetooth-autoconnect = Connect automatically
    .description = Whenever it’s nearby
settings-bluetooth-kind-headphones = Headphones
settings-bluetooth-kind-speaker = Speaker
settings-bluetooth-kind-mouse = Mouse
settings-bluetooth-kind-keyboard = Keyboard
settings-bluetooth-kind-gamepad = Game controller
settings-bluetooth-kind-phone = Phone
settings-bluetooth-kind-computer = Computer
settings-bluetooth-kind-tablet = Tablet
settings-bluetooth-kind-display = Display
settings-bluetooth-kind-printer = Printer
settings-bluetooth-kind-camera = Camera
settings-bluetooth-kind-other = Other device

## Bluetooth: pairing requests
## $name is the device's name, or settings-bluetooth-request-unnamed when it has none.

# Stands in for the device's name inside the sentences below when the device doesn't tell its name
settings-bluetooth-request-unnamed = the device
settings-bluetooth-request-confirm = Pair with { $name }?
    .description = Make sure { $name } shows the same code.
settings-bluetooth-request-authorize = Allow { $name } to pair?
    .description = { $name } will be able to connect to this computer.
settings-bluetooth-request-pin = Enter the PIN for { $name }
    .description = It's often 0000 or 1234. The device's manual will have it if neither works.
settings-bluetooth-request-passkey = Enter the code shown on { $name }
    .description = Type the six digits exactly as they appear.
settings-bluetooth-request-display = Pair with { $name }
    .description = Type this code on { $name }, then press Enter.
# Button
settings-bluetooth-pair = Pair
# Button
settings-bluetooth-allow = Allow

## Bluetooth: devices paired in Windows on the same computer

settings-bluetooth-windows = Bring your devices from Windows
    .description = { $count ->
        [one] { $devices } is paired in Windows. Use it here without pairing again.
       *[other] { $devices } are paired in Windows. Use them here without pairing again.
    }
# Ends a list of device names, like "Keyboard, Mouse and 3 more"
settings-bluetooth-windows-more = { $count ->
        [one] { $count } more
       *[other] { $count } more
    }

## Accounts panel

settings-accounts-unavailable = Accounts aren’t available
    .description = The accounts service isn’t installed on this computer
settings-accounts-online = Online accounts
    .description = Each account is a folder in Cloud, in your home folder, that every app can open. Files download when you open them.
settings-accounts-add-description = iCloud Drive, OneDrive, Dropbox, Nextcloud or WebDAV

## Accounts: an account's row

settings-accounts-sign-in-again-needed = Sign in again to keep using it
settings-accounts-paused-metered = Syncing paused on a metered connection
settings-accounts-paused-battery = Syncing paused while the battery is low
settings-accounts-connecting = Connecting…
settings-accounts-offline = Offline
settings-accounts-offline-kept = Offline, kept files are still here
settings-accounts-not-connected = Not connected
settings-accounts-syncing = { $count ->
        [one] Syncing { $count } change
       *[other] Syncing { $count } changes
    }
settings-accounts-name = Name
settings-accounts-folder = Folder
settings-accounts-server = Server
settings-accounts-storage = Storage
# $used and $total are sizes, like "2 GB"
settings-accounts-storage-used = { $used } of { $total } used
settings-accounts-on-device = On this device
settings-accounts-kept = { $count ->
        [one] { $count } item kept, the rest downloads when opened
       *[other] { $count } items kept, the rest downloads when opened
    }
settings-accounts-on-demand = Files download when you open them
# Button
settings-accounts-sign-in-again = Sign in again
# Button that cancels removing an account
settings-accounts-keep = Keep
# Button
settings-accounts-remove = Remove
# Button that confirms removing an account
settings-accounts-remove-confirm = Remove from this computer
settings-accounts-removing = Removing…
# $provider is the service's name, like "OneDrive"
settings-accounts-remove-note = Your files stay in { $provider }. Changes made here are sent up first.

## Accounts: providers

settings-accounts-provider-icloud = Your Apple Account, confirmed with a code from your iPhone, iPad or Mac
settings-accounts-provider-onedrive = A personal, work or school Microsoft account, in your browser
settings-accounts-provider-dropbox = A Dropbox account, in your browser
settings-accounts-provider-nextcloud = Your own or your organization’s server
settings-accounts-provider-webdav = Any server that speaks WebDAV

## Accounts: signing in

# Dialog title; $account is the account's name
settings-accounts-sign-in-again-title = Sign in to { $account } again
# $provider is Microsoft or Dropbox
settings-accounts-browser = Your browser opens so you can sign in with { $provider }. Luft never sees your password.
# $user is the account's email address
settings-accounts-password-for = Enter the password for { $user }.
settings-accounts-apple-account = Apple Account
settings-accounts-password = Password
settings-accounts-app-password = App password
settings-accounts-user = User name
settings-accounts-apple-note = Use your Apple Account password; app-specific passwords don’t work here. Apple then shows a code on your iPhone, iPad or Mac.
settings-accounts-nextcloud-browser = Your browser opens so you can sign in to your server and allow Luft in.
settings-accounts-use-app-password = Use an app password instead
settings-accounts-error-server = Enter the server address
settings-accounts-error-apple-account = Enter your Apple Account email
settings-accounts-error-user = Enter the user name
settings-accounts-error-password = Enter the password
# Button
settings-accounts-cancel = Cancel
# Button
settings-accounts-back = Back
# Button
settings-accounts-continue-in-browser = Continue in browser
# Button
settings-accounts-sign-in = Sign in
# Button
settings-accounts-try-again = Try again
# Button
settings-accounts-continue = Continue
# $provider is the service's name, like "iCloud Drive"
settings-accounts-working = Talking to { $provider }…
# $provider is the service's name, like "OneDrive"
settings-accounts-finish-in-browser = Finish signing in with { $provider } in your browser. Luft never sees your password, and this updates on its own once you’re done.
settings-accounts-no-browser = No browser opened. Copy the link and open it in a browser.
settings-accounts-open-again = Open the page again
settings-accounts-copy-link = Copy the link
settings-accounts-copied = Copied
settings-accounts-code = Verification code
    .placeholder = 6-digit code
settings-accounts-text-me = Text me a code instead
settings-accounts-choose-phone = Which number should Apple text the code to?
    .description = Send a text message
settings-accounts-approve = Your Apple Account uses Advanced Data Protection. Approve the request on your iPhone, iPad or Mac to let this computer open iCloud Drive.
