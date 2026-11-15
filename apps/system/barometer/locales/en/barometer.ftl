## Sidebar and header

barometer-views = Views
barometer-processes-title = Processes
barometer-cpu-title = Processor
barometer-memory-title = Memory
barometer-battery-title = Battery
# A battery's page when there are several; the variable is the battery's own name, such as BAT1.
barometer-battery-named = Battery { $name }
# Two devices with the same name are told apart by a number after it.
barometer-numbered = { $name } { $number }

## Preferences

barometer-preferences = Preferences
barometer-preferences-speed = Update speed
barometer-preferences-speed-slow = Slow
barometer-preferences-speed-normal = Normal
barometer-preferences-speed-fast = Fast
barometer-preferences-speed-faster = Faster
# How far back the graphs reach.
barometer-preferences-history = History
barometer-preferences-temperature = Temperature
barometer-preferences-glide = Glide graphs
barometer-preferences-glide-description = Slide graphs along as new values come in
barometer-preferences-bits = Network speed in bits
barometer-preferences-bits-description = Show Mbit/s instead of MB/s
barometer-preferences-share = Share of the whole processor
barometer-preferences-share-description = Process usage out of all cores instead of one
barometer-preferences-virtual = Virtual devices
barometer-preferences-virtual-description = Loop devices, bridges and other virtual drives and networks

## Processes

barometer-processes-count = { $count ->
    [one] { $count } process
   *[other] { $count } processes
}
barometer-apps-count = { $count ->
    [one] { $count } app
   *[other] { $count } apps
}
barometer-view = View
barometer-view-grouped = Grouped
barometer-view-flat = All processes
barometer-search = Search
# The search found nothing; the variable is what was typed.
barometer-search-empty = Nothing matches “{ $query }”.
barometer-end-app = End app
barometer-end-process = End process
# Opens an app that runs in the background.
barometer-open = Open
# Stops an app that runs in the background.
barometer-stop = Stop

barometer-group-apps = Apps
barometer-group-background = Background
barometer-group-system = System
# Collapses a group of the list; the variable is its name, such as Apps.
barometer-group-hide = Hide { $group }
barometer-group-show = Show { $group }
barometer-processes-hide = Hide processes
barometer-processes-show = Show processes

barometer-note-stopping = Stopping
barometer-note-unresponsive = Not responding
barometer-note-paused = Paused

## Columns

barometer-column-name = Name
# Process ID
barometer-column-pid = PID
barometer-column-user = User
barometer-column-cpu = CPU
barometer-column-memory = Memory
# How fast a process reads from drives right now.
barometer-column-read = Reading
barometer-column-write = Writing
# How much a process has read from drives in total.
barometer-column-read-total = Read
barometer-column-write-total = Written
barometer-column-gpu = GPU
barometer-column-vram = Video memory
# Use of the graphics card's video encoder.
barometer-column-encoder = Encode
barometer-column-decoder = Decode
barometer-column-time = Processor time
barometer-column-threads = Threads
barometer-column-nice = Priority
barometer-column-state = State
barometer-column-started = Started
barometer-column-command = Command

barometer-state-running = Running
barometer-state-sleeping = Sleeping
barometer-state-waiting = Waiting
barometer-state-stopped = Stopped
barometer-state-traced = Traced
barometer-state-zombie = Zombie
barometer-state-idle = Idle
barometer-state-dead = Dead

## Process menu

barometer-menu-details = Details
barometer-menu-copy-command = Copy command
barometer-menu-priority = Change priority…
barometer-menu-resume = Resume
barometer-menu-pause = Pause
barometer-menu-end = End
barometer-force-quit = Force quit

## Process details

barometer-details-process = Process { $pid }
barometer-details-cpu = Processor
barometer-details-memory = Memory
barometer-details-disk = Disk
barometer-details-command-line = Command line
barometer-details-program = Program
barometer-details-folder = Working folder
# When a process started; $date is a date and time, $duration how long ago, such as 5m.
barometer-details-started = { $date }, { $duration } ago
barometer-details-parent = Parent
# The process that started this one, with its process ID.
barometer-details-parent-named = { $name } ({ $pid })
barometer-details-open-files = Open files
# What the process runs in, such as Flatpak.
barometer-details-runs-in = Runs in
barometer-details-cgroup = Control group
barometer-details-resident = Resident memory
barometer-details-private = Private
barometer-details-mapped = Mapped files
barometer-details-shared = Shared
barometer-details-swapped = Swapped out
barometer-details-address-space = Address space
barometer-details-switches = Context switches
barometer-details-oom = Out of memory score
barometer-details-state-running = Running
barometer-details-state-sleeping = Sleeping
barometer-details-state-waiting = Waiting for a device
barometer-details-state-paused = Paused
barometer-details-state-traced = Traced
barometer-details-state-zombie = Finished, waiting for its parent
barometer-details-state-idle = Idle
barometer-close = Close

## Priority

barometer-priority-title = Priority of { $name }
barometer-priority-description = Higher priority gets it more processor time when others want it too. Above normal asks for your password.
barometer-priority-presets = Priority
barometer-priority-highest = Highest
barometer-priority-high = High
barometer-priority-normal = Normal
barometer-priority-low = Low
barometer-priority-lowest = Lowest
barometer-priority-niceness = Niceness
barometer-priority-range = Niceness from −20, the highest priority, to 19, the lowest.
barometer-cancel = Cancel
barometer-priority-change = Change

## An app that doesn't close

barometer-stuck-title = { $name } isn't closing
barometer-stuck-description = It's still running. Force quitting ends it right away, and anything unsaved in it is lost.
barometer-stuck-wait = Wait

## Shared by the device pages

barometer-now = Now
barometer-details = Details
barometer-model = Model
barometer-manufacturer = Manufacturer
barometer-driver = Driver
barometer-temperature = Temperature
barometer-free = Free
barometer-yes = Yes
barometer-no = No
barometer-since-startup = Since startup
# The highest a value goes, such as a processor's speed.
barometer-up-to = Up to { $value }
# Under an amount, the total it is part of.
barometer-of = of { $total }
barometer-used-of = { $used } of { $total }
barometer-range = { $from } – { $to }

## Processor

barometer-cpu-utilization = Utilization
barometer-cpu-speed = Speed
barometer-cpu-load = Load average
barometer-cpu-load-detail = 1, 5 and 15 minutes
barometer-cpu-switches = Context switches
barometer-cpu-uptime = Up for
barometer-cpu-cores-title = Each core
barometer-cpu-cores-show = Show each core
barometer-cpu-core = Core { $number }
barometer-cpu-cores = Cores
barometer-cpu-cores-value = { $cores ->
    [one] { $cores } core
   *[other] { $cores } cores
}, { $threads ->
    [one] { $threads } thread
   *[other] { $threads } threads
}
barometer-cpu-sockets = Sockets
barometer-cpu-frequency-range = Frequency range
# The processor's frequency governor, such as powersave.
barometer-cpu-scaling = Scaling
barometer-cpu-virtualization = Virtualization
barometer-cpu-architecture = Architecture
# A processor cache by level; Data and Instruction caches are written L1d and L1i.
barometer-cpu-cache = { $kind ->
    [Data] L{ $level }d cache
    [Instruction] L{ $level }i cache
   *[other] L{ $level } cache
}

## Memory

barometer-memory-installed = { $size } installed
barometer-memory-in-use = In use
barometer-memory-composition = Composition
barometer-memory-composition-label = Memory composition
barometer-memory-cache = Cache
barometer-memory-available = Available
barometer-memory-apps = Apps
barometer-memory-apps-detail = Private memory of programs
barometer-memory-cached = Cached files
barometer-memory-shared = Shared
barometer-memory-kernel = Kernel
barometer-memory-dirty = Waiting to be written
barometer-memory-committed = Committed
barometer-memory-committed-detail = Promised to programs
barometer-swap = Swap
barometer-swap-title = Swap and compression
barometer-swap-kind-compressed = Compressed in memory
barometer-swap-kind-partition = Partition
barometer-swap-kind-file = File
barometer-swap-cached = Swapped back in
barometer-swap-compressed = Compressed
barometer-swap-compressed-value = { $stored } stored in { $size }
barometer-swap-ratio = Compression ratio

## Graphics

barometer-gpu-integrated = Integrated graphics
barometer-gpu-usage = Usage
barometer-gpu-engines = Video engines
barometer-gpu-power = Power
barometer-gpu-clock = Clock
barometer-gpu-memory-clock = Memory clock
barometer-gpu-power-limit-value = Limit { $power }
barometer-gpu-fan = Fan
barometer-gpu-slot = Slot
barometer-gpu-link = Link
barometer-gpu-power-limit = Power limit
barometer-gpu-max-clock = Highest clock
barometer-gpu-max-memory-clock = Highest memory clock

## Drives

barometer-drive-kind-nvme = NVMe SSD
barometer-drive-kind-ssd = SSD
barometer-drive-kind-hdd = Hard drive
barometer-drive-kind-usb = USB drive
barometer-drive-kind-sd = SD card
barometer-drive-kind-emmc = Built-in flash
barometer-drive-kind-optical = Optical drive
barometer-drive-kind-loop = Disk image
barometer-drive-kind-zram = Compressed memory
barometer-drive-kind-mapper = Mapped volume
barometer-drive-kind-encrypted = Encrypted volume
barometer-drive-kind-raid = RAID array
barometer-drive-kind-virtual = Virtual drive
barometer-drive-activity = Activity
barometer-drive-busy = Busy
barometer-drive-speed = Transfer speed
barometer-drive-read = Read
barometer-drive-write = Write
barometer-drive-read-total = Read since startup
barometer-drive-write-total = Written since startup
barometer-drive-space = Space
barometer-drive-space-label = Space used
barometer-drive-used = Used
barometer-drive-kind = Kind
barometer-drive-device = Device
barometer-drive-capacity = Capacity
barometer-drive-mounted = Mounted at
barometer-drive-removable = Removable
barometer-drive-read-only = Read only

## Networks

barometer-network-kind-ethernet = Ethernet
barometer-network-kind-wifi = Wi-Fi
barometer-network-kind-bridge = Bridge
barometer-network-kind-vpn = VPN
barometer-network-kind-mobile = Mobile broadband
barometer-network-kind-virtual = Virtual network
barometer-network-traffic = Traffic
barometer-network-download = Download
barometer-network-upload = Upload
barometer-network-downloading = Downloading
barometer-network-uploading = Uploading
barometer-network-downloaded = Downloaded
barometer-network-uploaded = Uploaded
barometer-network-signal = Signal
barometer-network-status = Status
barometer-network-connected = Connected
barometer-network-disconnected = Disconnected
barometer-network-link-speed = Link speed
barometer-network-addresses = Addresses
barometer-network-mac = Hardware address
barometer-network-adapter = Adapter
barometer-network-interface = Interface
barometer-network-mtu = MTU

## Battery

barometer-battery-state-charging = Charging
barometer-battery-state-discharging = On battery
barometer-battery-state-full = Fully charged
barometer-battery-state-not-charging = Not charging
barometer-battery-charge = Charge
barometer-battery-charging-rate = Charging rate
barometer-battery-power-draw = Power draw
barometer-battery-full-in = Full in
barometer-battery-time-left = Time left
barometer-battery-charging-at = Charging at
barometer-battery-drawing = Drawing
barometer-battery-health = Health
barometer-battery-health-detail = Capacity compared to new
barometer-battery-cycles = Charge cycles
barometer-battery-status = Status
barometer-battery-plugged-in = Plugged in
barometer-battery-energy = Energy
barometer-battery-energy-full = Full charge
barometer-battery-energy-design = Designed for
barometer-battery-voltage = Voltage
barometer-battery-technology = Technology
