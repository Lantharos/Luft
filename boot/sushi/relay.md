Technically, I’d implement Relay in **4 layers**, in this order:

```text
1. relayd in initramfs       ← MVP, biggest visual improvement
2. greeter bridge            ← removes final black-screen/login jank
3. native driver handoff     ← hard but doable-ish
4. RelayBoot.efi             ← earliest spinner, only after rest works
```

Do **not** start with the custom UEFI bootloader. That is the sexy part, not the useful part. The bootloader can make the first second nicer, but the initramfs/driver/greeter handoffs are where Linux usually faceplants.

---

# 1. `relayd`: the core daemon

This is the main thing.

`relayd` runs inside initramfs and owns the visual boot scene.

```text
relayd
├─ display backend
├─ renderer
├─ state manager
├─ unlock controller
├─ handoff controller
├─ event logger
└─ recovery UI
```

It starts as early as possible in initramfs.

On Fedora/RHEL-style systems, this means a **dracut module**. Dracut is modular and supports adding custom modules into the initramfs, with modules living under module directories such as `/usr/lib/dracut/modules.d`; that is exactly the integration point Relay would use. ([man7.org][1])

Conceptually:

```text
kernel starts
→ initramfs starts
→ relayd starts before disk unlock
→ relayd grabs display
→ relayd draws logo + spinner
→ relayd handles LUKS unlock
→ relayd keeps scene alive until greeter
```

The MVP daemon should be a **static Rust binary** with almost no dependencies. No GTK. No Qt. No webview. No shaders. No “oops fontconfig is missing in initramfs.”

Early boot is a cave. Bring a rock, not Chromium.

---

# 2. Display backends

Relay needs multiple display backends because early boot graphics are inconsistent.

Start with this backend order:

```text
1. DRM/KMS backend
2. fbdev backend
3. text fallback backend
```

## Backend A: framebuffer / fbdev

This is the simplest MVP.

Linux has framebuffer support, and the framebuffer console exists specifically as a console running on top of framebuffer devices. ([Kernel Documentation][2])

Relay can open something like:

```text
/dev/fb0
```

Then:

```text
mmap framebuffer
draw background
draw logo
draw spinner
draw password box if needed
```

This is crude, but very reliable.

The Linux kernel docs list EFI framebuffer support via `efifb`, which supports UEFI systems with Graphics Output Protocol displays. ([Kernel Documentation][3])

So your MVP renderer can do:

```text
if /dev/fb0 exists:
    use it
else:
    fallback to text/recovery mode
```

## Backend B: DRM/KMS

Production Relay should move to DRM/KMS because fbdev is old and limited.

The DRM backend would:

```text
open /dev/dri/card*
pick connector/output
create dumb buffer
draw frame into buffer
set mode if needed
page flip / atomic commit
```

But I would not lock this into the spec. Codex can figure out the exact DRM implementation later. The requirement is:

> Relay must be able to draw a visually identical boot frame on the next display backend before giving up the previous one.

That’s the important part.

---

# 3. Renderer

The renderer should be shared by every stage.

```text
relay-render
├─ draw_background()
├─ draw_logo()
├─ draw_spinner()
├─ draw_password_box()
├─ draw_status()
├─ draw_recovery_menu()
└─ render_frame(state)
```

Do not make each stage invent its own layout. That’s how you get the cursed Linux boot vibe where the logo teleports between realities.

The renderer takes a `RelayVisualState`:

```text
RelayVisualState
├─ screen size
├─ scale
├─ background
├─ logo source
├─ logo bounds
├─ spinner bounds
├─ spinner phase
├─ current mode
│  ├─ booting
│  ├─ unlocking
│  ├─ updating
│  ├─ recovering
│  └─ handing_off
├─ status text
└─ handoff token
```

Then every stage renders the same scene.

UEFI, initramfs, driver handoff, and greeter all agree on:

```text
logo here
spinner/password box here
background this color
animation at this phase
```

That is how you fake “one continuous boot.”

---

# 4. Visual state handoff

Relay needs a small shared state format.

Not implementation-locked, but conceptually:

```rust
struct RelayVisualState {
    version: u32,
    boot_id: [u8; 16],
    stage: RelayStage,

    width: u32,
    height: u32,
    scale: f32,

    background: Color,
    logo: LogoDescriptor,
    logo_rect: Rect,

    activity_rect: Rect,
    spinner_phase: f32,
    timestamp_ns: u64,

    mode: VisualMode,
    flags: VisualFlags,
}
```

Important rule:

```text
RelayVisualState never contains secrets.
```

No passphrases. No recovery keys. No TPM key material. No usernames. No serial numbers unless explicitly allowed in diagnostics.

Pass it between stages using whatever is most practical:

```text
UEFI → kernel/initramfs:
  EFI config table / reserved memory / initrd metadata

initramfs → system:
  /run/relay/state

system → greeter:
  Unix socket / file descriptor / inherited state file
```

Again, don’t lock this down too early. The spec should define the **contract**, not the exact mechanism.

---

# 5. Boot event bus

Internally, Relay should be event-based.

```text
RelayEvent
├─ boot.first_frame
├─ handoff.prepare
├─ handoff.begin
├─ handoff.complete
├─ unlock.tpm.try
├─ unlock.tpm.success
├─ unlock.manual.required
├─ unlock.manual.failed
├─ display.backend.changed
├─ display.driver.ready
├─ greeter.waiting
├─ greeter.ready
├─ boot.complete
└─ boot.degraded
```

Then you render two log modes from the same event:

Machine log:

```json
{
  "stage": "RelayDisplay",
  "event": "handoff.begin",
  "target": "native-drm",
  "severity": "info"
}
```

Human log:

```text
RelayDisplay: handing off!
```

This gives you cool logs without making the actual system unserious.

---

# 6. LUKS unlock flow

Relay should not reimplement crypto. It should own the **UX and orchestration**, while calling existing trusted unlock mechanisms.

Linux disk encryption normally means LUKS. `systemd-cryptenroll` supports enrolling TPM2, FIDO2, PKCS#11, and passphrase credentials into LUKS2 volumes; systemd’s docs describe TPM PCR policies as binding secrets to specific software versions/system state, so a key can be unsealed only when the trusted state matches. ([man7.org][4])

Relay’s flow should be:

```text
relayd starts
→ detect encrypted volumes
→ check policy
→ try TPM unlock if allowed
→ if TPM succeeds: continue, no prompt
→ if TPM unavailable or rejected: show native password prompt
→ unlock using existing cryptsetup/systemd mechanism
→ wipe passphrase memory
→ resume spinner
```

Pseudo-flow:

```text
RelayUnlock: checking trust
RelayUnlock: asking the TPM nicely
RelayUnlock: TPM said yes
RelayUnlock: disk is open
```

Fallback:

```text
RelayUnlock: TPM said no
RelayUnlock: password needed
```

The password prompt appears exactly where the spinner was:

```text
        [OEM logo]

       [password box]
```

The logo does **not** move.

Security rules:

```text
do not log passphrases
do not store passphrases
do not put secrets in visual state
clear memory after use
do not load themes/plugins in unlock path
do not silently weaken TPM policy
fallback to manual unlock on trust mismatch
```

Relay should not be “doing encryption.” Relay should be the polished native front-end for the existing unlock stack.

---

# 7. OEM/device logo

You want the device logo as the anchor.

Implementation-wise, there are a few possible sources:

```text
firmware boot graphics / BGRT-style logo
vendor-provided logo asset
distro-configured fallback logo
Relay fallback mark
```

Don’t make logo extraction fragile. The rule should be:

```text
try OEM logo
if safe and available: use it
else: distro logo
else: Relay fallback
```

Also: treat logo parsing as attack surface.

So:

```text
no arbitrary complex image decoding in secure early boot
prefer already-normalized/cached assets
bounded dimensions
bounded file size
safe formats only
no SVG scripting nonsense
```

If RelayBoot.efi later captures the OEM logo/frame, it can pass the logo descriptor to initramfs through `RelayVisualState`.

---

# 8. Native driver handoff

This is the hard part.

Current flow:

```text
simple framebuffer
→ real GPU driver loads
→ display resets
→ black flash
→ new framebuffer
```

Relay flow should be:

```text
early backend draws frame
→ native driver appears
→ Relay prepares same frame on native backend
→ Relay switches only when native frame is ready
→ if hardware blinks anyway, restore scene immediately
```

You need a `DisplayManager` abstraction:

```rust
trait DisplayBackend {
    fn probe() -> bool;
    fn acquire() -> Result<Display>;
    fn render(frame: Frame);
    fn present();
    fn release();
}
```

Backends:

```text
FbdevBackend
DrmBackend
TextBackend
```

Then:

```text
current = FbdevBackend
draw spinner

when DRM appears:
    drm = DrmBackend.acquire()
    drm.render(same_visual_state)
    drm.present()
    current.release()
```

Reality check: some drivers will still blink because the hardware mode gets reset. Relay cannot defeat physics/vendor cursedness. But it can make the screen come back to the same scene instead of dumping the user into boot garbage.

Diagnostic log:

```text
RelayDisplay: native driver showed up
RelayDisplay: matching the frame
RelayDisplay: handing off!
```

If it blinks:

```text
RelayDisplay: the driver blinked
RelayDisplay: restoring the scene
RelayDisplay: back like nothing happened
```

---

# 9. Greeter handoff

Relay needs a greeter protocol.

The greeter should not just start and maybe appear someday. It needs to say:

```text
I rendered my first frame.
You can leave now.
```

Flow:

```text
relayd keeps boot scene visible
→ greeter starts
→ greeter reads RelayVisualState
→ greeter renders matching first frame
→ greeter signals READY
→ relayd releases display
→ greeter owns screen
→ greeter animates logo/input into login layout
```

You need a small protocol:

```text
/run/relay/greeter.sock
```

Messages:

```text
HELLO_GREETER
VISUAL_STATE_REQUEST
FIRST_FRAME_READY
TAKEOVER_READY
TAKEOVER_COMPLETE
```

Greeter rule:

```text
First greeter frame must visually match Relay’s last boot frame.
```

After that, the greeter can animate:

```text
spinner fades
password/user controls appear
logo moves if needed
```

Before greeter ownership, logo stays fixed.

---

# 10. Bootloader stage: `RelayBoot.efi`

This is later.

RelayBoot is a UEFI app that replaces the ugly bootloader visual.

It should:

```text
set/preserve GOP display mode
show OEM logo
draw spinner
load selected kernel/initramfs
prepare RelayVisualState
handoff to kernel
```

UEFI framebuffer support matters because Linux can use EFI framebuffer paths; kernel docs note `efifb` supports UEFI systems with GOP displays. ([Kernel Documentation][3])

But RelayBoot should probably not invent a whole boot entry ecosystem. It should interoperate with the existing Boot Loader Specification. The Boot Loader Specification defines formats and conventions for sharing boot loader menu entries between operating systems and boot loaders. ([The Linux Userspace API Group][5])

So:

```text
RelayBoot.efi reads BLS entries
→ shows clean boot UI
→ boots selected entry
```

This avoids becoming “GRUB but prettier and worse.”

Possible path:

```text
Phase 1: use systemd-boot/GRUB, no RelayBoot
Phase 2: RelayBoot reads BLS entries
Phase 3: RelayBoot supports fallback boot counting/recovery
```

`systemd-boot` already uses the Boot Loader Specification and has simple boot counting/fallback behavior, which is a good model to avoid breaking update rollback flows. ([FreeDesktop][6])

---

# 11. Initramfs integration

For Fedora/Glacier-style systems, use dracut.

Conceptual module:

```text
/usr/lib/dracut/modules.d/90relay/
├─ module-setup.sh
├─ relayd
├─ relay-unlock
├─ relay-render assets
├─ relay-init hooks
└─ relay-emergency hooks
```

The dracut module would:

```text
install relayd binary
install minimal config
install logo assets/fallbacks
install unlock helper
install systemd units or init hooks
install udev rules if needed
start relayd early
route password prompts to Relay
```

If using systemd in initramfs:

```text
relay-initramfs.service
relay-unlock.service
relay-handoff.service
```

If using shell hooks:

```text
pre-mount hook starts relayd
crypt hook talks to relayd
pre-pivot hook passes state forward
```

MVP approach:

```text
dracut module
static relayd
fbdev renderer
manual LUKS prompt
handoff to greeter via /run/relay/state
```

---

# 12. How password prompting connects

The clean architecture is:

```text
cryptsetup/systemd asks for passphrase
→ Relay provides ask-password agent
→ Relay shows native UI
→ Relay returns passphrase securely
```

Do not make every unlock component know about the UI. Relay should act as the native prompt provider.

Flow:

```text
unlock request comes in
→ relayd switches mode to Unlocking
→ spinner area becomes password field
→ user enters passphrase
→ relayd sends passphrase to unlock helper
→ helper attempts unlock
→ result returns
→ relayd wipes passphrase
```

Wrong password:

```text
RelayUnlock: wrong key, try again
```

No full reset. No logo movement. No “welcome to initramfs hell.”

---

# 13. Recovery UI

Relay needs a recovery UI from day one.

Because if graphics boot fails and Relay just spins forever, it becomes Plymouth with better branding. Mid.

Recovery should have states:

```text
Unlock failed too many times
TPM policy mismatch
Root mount failed
Driver handoff failed
Greeter failed
Update failed
```

UI:

```text
[logo]

Could not mount system disk.

[Try again]
[View details]
[Recovery shell]
[Reboot]
[Shut down]
```

Policy-controlled:

```text
Recovery shell may be disabled in secure mode.
Debug logs may hide sensitive data.
```

Cool logs should become less playful during serious failures:

```text
Relay: boot degraded
RelaySystem: root mount failed
Relay: recovery needed
```

Not:

```text
oopsie disk is dead lol
```

There is a line. Do not cross the clown line.

---

# 14. `relayctl`

After boot, you want:

```bash
relayctl status
relayctl log
relayctl diagnose
relayctl handoffs
relayctl replay
```

Example:

```text
Relay diagnosis

Boot continuity: degraded
First frame: 0.41s
Visual handoffs: 4
Failed handoffs: 1
Black-screen events: 1

Problem:
Native GPU driver reset the display during handoff.

Recovery:
Relay restored the scene after 184ms.

Suggestion:
Load the native graphics driver earlier in initramfs.
```

This is extremely useful because otherwise “boot felt ugly” is impossible to debug.

Also add:

```bash
relayctl record-boot
relayctl export-diagnostics
```

Maybe eventually:

```bash
relayctl replay /var/log/relay/boot-xyz.relaylog
```

So you can replay the boot sequence visually. That would be sick and actually useful for polish work.

---

# 15. Security model

Relay should have separate trust zones:

```text
Trusted boot path:
  RelayBoot.efi
  kernel
  initramfs
  relayd
  unlock helper

Untrusted/customizable path:
  visual theme
  logo fallback
  status wording
```

The unlock path must not load arbitrary themes/plugins.

Secure mode:

```text
only signed Relay components
only signed theme/config bundles
no custom scripts
no arbitrary image formats
debug shell disabled or policy-gated
TPM unlock only under expected measurements
manual fallback always available if policy allows
```

Relay should support Secure Boot rather than telling people to turn it off. Also, TPM unlock should be conditional on measured/trusted state, because systemd’s TPM2 PCR model binds secret access to specific software/system state. ([man7.org][4])

Security priorities:

```text
1. Do not weaken disk encryption.
2. Do not hide trust changes.
3. Do not leak secrets.
4. Do not let themes become code execution.
5. Do not make recovery impossible.
```

---

# 16. Project structure

Something like:

```text
relay/
├─ crates/
│  ├─ relay-core/          shared state, events, config
│  ├─ relay-render/        software renderer
│  ├─ relay-display/       backend abstraction
│  ├─ relay-display-fb/    fbdev/simple framebuffer backend
│  ├─ relay-display-drm/   DRM/KMS backend
│  ├─ relay-unlock/        unlock orchestration
│  ├─ relay-protocol/      greeter/handoff protocol
│  ├─ relay-log/           structured + human logs
│  ├─ relayd/              initramfs daemon
│  ├─ relayctl/            diagnostics CLI
│  └─ relayboot/           UEFI app later
├─ initramfs/
│  ├─ dracut/
│  └─ mkinitcpio/
├─ greeter/
│  ├─ protocol.md
│  └─ examples/
├─ themes/
│  └─ default/
└─ docs/
```

But for the first version, don’t over-crate it into Rust enterprise soup. Keep boundaries clean, not ridiculous.

---

# 17. MVP implementation order

## MVP 0: draw in initramfs

Goal:

```text
kernel starts → relayd draws logo + spinner in initramfs
```

Implement:

```text
static relayd
fbdev backend
simple software renderer
hardcoded logo/spinner
dracut module
```

No LUKS yet. No UEFI. No greeter.

## MVP 1: LUKS prompt

Goal:

```text
spinner becomes password box
logo stays fixed
disk unlocks
spinner returns
```

Implement:

```text
ask-password integration
passphrase box
wrong password state
memory wiping
minimal recovery
```

## MVP 2: greeter handoff

Goal:

```text
Relay stays visible until greeter first frame is ready
```

Implement:

```text
/run/relay/state
/run/relay/greeter.sock
greeter reads state
greeter signals READY
Relay exits cleanly
```

## MVP 3: TPM unlock

Goal:

```text
try TPM silently
show prompt only if needed
```

Implement:

```text
policy check
TPM unlock integration
manual fallback
trust-changed UI
```

## MVP 4: DRM backend

Goal:

```text
switch from early framebuffer to real DRM backend with matching frame
```

Implement:

```text
DRM/KMS backend
backend migration
handoff diagnostics
black-screen detection if possible
```

## MVP 5: RelayBoot.efi

Goal:

```text
first spinner before Linux even starts
```

Implement:

```text
UEFI app
BLS entry reading
GOP drawing
visual state passing
kernel/initramfs boot
Secure Boot signing story
```

This order gives you usable wins early instead of vanishing for six months into EFI sadness.

---

# 18. The real architecture in one flow

```text
Firmware shows OEM logo
        ↓
RelayBoot.efi optionally preserves/uses OEM logo
        ↓
RelayBoot draws spinner and creates RelayVisualState
        ↓
Kernel starts and preserves firmware framebuffer where possible
        ↓
relayd starts in initramfs
        ↓
relayd reads RelayVisualState or reconstructs closest scene
        ↓
relayd draws logo + spinner
        ↓
RelayUnlock tries TPM
        ↓
if TPM works:
    continue silently
else:
    spinner area becomes password box
        ↓
root unlocks and mounts
        ↓
native GPU driver appears
        ↓
relayd prepares same frame on native display backend
        ↓
RelayDisplay: handing off!
        ↓
system boot continues
        ↓
greeter starts and renders matching first frame
        ↓
RelayGreeter: handing off!
        ↓
greeter owns screen
        ↓
login UI appears
```

That’s Relay.

Not “a bootloader.” Not “a splash screen.”

It’s a **boot continuity runtime**.

The first version can be hilariously simple: static binary, framebuffer, spinner, password prompt. But the architecture leaves room for the whole fancy “UEFI to greeter without the screen emotionally dying” vision.

[1]: https://man7.org/linux/man-pages/man7/dracut.modules.7.html?utm_source=chatgpt.com "dracut.modules(7) - Linux manual page"
[2]: https://docs.kernel.org/fb/fbcon.html?utm_source=chatgpt.com "The Framebuffer Console"
[3]: https://docs.kernel.org/fb/efifb.html?utm_source=chatgpt.com "efifb - Generic EFI platform driver"
[4]: https://man7.org/linux/man-pages/man1/systemd-cryptenroll.1.html?utm_source=chatgpt.com "systemd-cryptenroll(1) - Linux manual page"
[5]: https://uapi-group.org/specifications/specs/boot_loader_specification/?utm_source=chatgpt.com "UAPI.1 Boot Loader Specification"
[6]: https://www.freedesktop.org/software/systemd/man/systemd-boot.html?utm_source=chatgpt.com "systemd-boot"

