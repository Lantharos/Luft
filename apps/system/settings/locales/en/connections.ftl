### Network and Bluetooth panels

## Network: shared words

# Button
settings-network-save = Save
# Button label while saving
settings-network-saving = Saving
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
settings-network-link-connecting = Connecting
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
settings-network-known-count = { $count ->
        [one] { $count } saved network
       *[other] { $count } saved networks
    }
# A known network that is nearby but not connected
settings-network-known-in-range = In range
settings-network-ethernet = Ethernet
# Used when the computer has several network cables; $name is the network card's name
settings-network-ethernet-named = Ethernet ({ $name })
# A phone sharing its internet over a cable, when the phone doesn't give its name
settings-network-phone = Phone
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
settings-network-wifi-searching = Looking for networks
settings-network-hidden = Connect to a hidden network
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

## Network: firewall

# $network is the name of the network the computer is connected to
settings-network-firewall-summary-home = { $network } is a home network
# $network is the name of the network the computer is connected to
settings-network-firewall-summary-public = { $network } is a public network
settings-network-firewall = Firewall
    .description = Devices on a network reach only what you let them.
# A link that opens a window explaining the firewall
settings-network-firewall-how = How this works
settings-network-firewall-how-done = Done
settings-network-firewall-how-networks = Home and public networks
    .description = Every network counts as public until you choose. On home networks, devices can find this computer and reach the apps you allowed there. On public networks, such as in a café or a hotel, they reach only the apps you allowed everywhere, and this computer stays hidden.
settings-network-firewall-how-apps = Apps
    .description = The first time an app waits for connections from other devices, Luft asks whether to let them in. Forget an app’s answer to be asked again.
settings-network-firewall-how-post = Post
    .description = Post is let in on home networks while someone can find this computer. Choosing No one in Post’s settings closes it.
settings-network-firewall-how-extensions = Extensions
    .description = Extensions that take connections from devices on your network are let in on home networks while they're on.
settings-network-firewall-how-services = Services
    .description = Services that run without an app, such as a web or file server, need a port opened for them here.
settings-network-firewall-home = Home
settings-network-firewall-public = Public
settings-network-firewall-connected = Connected
settings-network-firewall-unchosen = Counts as public until you choose
settings-network-firewall-no-networks = No Wi‑Fi or wired networks yet
settings-network-firewall-apps = Apps
settings-network-firewall-post = Post
settings-network-firewall-post-open = Open on home networks
settings-network-firewall-post-closed = Closed, since no one can find this computer
# $app is the name of an app or a program
settings-network-firewall-forget = Forget { $app }
settings-network-firewall-apps-none = No app has asked yet
settings-network-firewall-access-home = Home networks
settings-network-firewall-access-anywhere = All networks
settings-network-firewall-access-blocked = Not allowed
# $app is the name of an app or a program
settings-network-firewall-access-label = Networks that can connect to { $app }
# Shown under a program that isn't part of an installed app, such as one started in a terminal
settings-network-firewall-program = Program on this computer
settings-network-firewall-services = Services
# $port is a port number, like 22
settings-network-firewall-port = Port { $port }
settings-network-firewall-extensions = Extensions
# $ports is a list of port numbers, like 53317
settings-network-firewall-extension-ports = { $count ->
    [one] Port { $ports }
   *[other] Ports { $ports }
}
settings-network-firewall-tcp = TCP
settings-network-firewall-udp = UDP
settings-network-firewall-close-port = Close this port
settings-network-firewall-open-port = Open a port
    .description = For a service on this computer, such as a web or file server
settings-network-firewall-port-number = Port
settings-network-firewall-protocol = Protocol
# Button
settings-network-firewall-open = Open
# Button label while opening a port
settings-network-firewall-opening = Opening
settings-network-firewall-error-port = Enter a port from 1 to 65535

## Post
# Post sends files to phones and computers nearby and takes what they send. Other devices need the free LocalSend app.

settings-post-visibility = Who can find this computer
settings-post-visibility-no-one = No one
settings-post-visibility-your-devices = Your devices
settings-post-visibility-everyone = Everyone
# $network is the name of the network the computer is connected to
settings-post-public = { $network } is a public network
    .description = Devices nearby can't find this computer here.
settings-post-make-home = Make it a home network
settings-post-name = Name
    .description = What other devices call this computer
settings-post-rename = Rename
settings-post-folder = Save received files in
# Where received files go unless another folder is chosen: a folder called Post inside Downloads
settings-post-folder-default = Post in Downloads
settings-post-folder-change = Change
settings-post-folder-downloads = Use Post in Downloads
settings-post-devices = Your devices
settings-post-devices-none = None yet
# $device is a device's name
settings-post-remove = Remove { $device }
settings-post-add = Add a device
# $name is what other devices call this computer, such as "Mara's Laptop"
settings-post-pair = Add a device
    .description = On the other device, send something to { $name } with LocalSend, and enter this PIN when it asks.
settings-post-pair-waiting = Waiting for the device
settings-post-copy-text = Put text from your devices on the clipboard
settings-post-copy-picture = Put a single picture someone sends on the clipboard too
settings-post-localsend = Phones and other computers need LocalSend, on the same network.
settings-post-localsend-link = Get LocalSend
settings-post-cancel = Cancel
settings-post-save = Save

## Network: VPN

settings-network-vpn = VPN
settings-network-vpn-off = Off
settings-network-vpn-none = Not set up
settings-network-vpn-import = Import from a file
    .description = WireGuard, OpenVPN and other VPN configuration files
settings-network-vpn-importing = Importing
settings-network-wireguard = Set up WireGuard
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
settings-network-wireguard-adding = Adding
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
settings-bluetooth-searching = Looking for devices
    .description = Put the device you want to add in pairing mode
settings-bluetooth-blocked = Bluetooth is turned off by a hardware switch
    .description = Use the switch or key on your computer to turn it on
# Screen-reader label of the button that opens a device's details
settings-bluetooth-details = Device details
settings-bluetooth-connected = Connected
# $battery is the device's battery level, like "80%"
settings-bluetooth-connected-battery = Connected · { $battery } battery
settings-bluetooth-connecting = Connecting
settings-bluetooth-disconnecting = Disconnecting
settings-bluetooth-pairing = Pairing
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
    .description = It’s often 0000 or 1234.
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
