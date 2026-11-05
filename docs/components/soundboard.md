# Soundboard

Soundboard ([apps/soundboard](../../apps/soundboard)) is a store app, not part of the image. Its Rust side owns the audio, so the sounds, the hotkeys and the virtual microphone keep working with the window closed, when no browser runs.

Sabine starts the program again for each window's host and for every later launch, so the audio starts in `SoundboardState::start`, which only the app's own process runs. Everything the app writes is in folders named after its app ID, the only ones Sabine's confinement lets it write to.

## The audio graph

The app is one PipeWire client with up to three streams, on one thread of its own:

| Node | Class | Exists | Runs |
| --- | --- | --- | --- |
| `soundboard` | `Audio/Source` | While the app runs | While a sound plays into it or the voice passes through |
| `soundboard-monitor` | `Stream/Output/Audio` | While the app runs | While a sound plays with hearing on |
| `soundboard-capture` | `Stream/Input/Audio` | While an app listens and the microphone isn't muted | The whole time it exists |

Streams, rather than links the app makes itself, because an app in a sandbox may not create links, and the session manager gets to treat them like any other device and stream. Everything else follows from who is listening: the app counts the links leaving `soundboard` from the registry, opens the real microphone at the first and closes it after the last, and pauses `soundboard` and `soundboard-monitor` whenever nothing plays through them. With nothing to do, the app has no timers and PipeWire never calls it. When the process dies, the sound server removes its nodes.

The voice goes from the capture stream to the virtual microphone through a small ring. The two nodes share a `node.group`, so they run from one clock, but they aren't linked to each other, so the voice can arrive one cycle late. Both ask for 256 frames at 48 kHz, or 5.3 ms.

`priority.session` on `soundboard` is -1, so WirePlumber never picks it as the default input while any other input exists. The app sets it as the default only when asked to, through the sound server's PulseAudio side, since PipeWire's settings are read-only from a sandbox. The default from before is saved first and put back on quit. After a crash the session manager falls back by itself, and the next start finds the saved default. The virtual microphone is never its own input: when it's the default, the real microphone comes from the highest-priority source that's left.

## Sounds

A sound is copied into the app's data folder and decoded with GStreamer to 48 kHz stereo floats, in a file next to it that the app maps into memory. A large board costs no memory until it plays. A press reads the start of the sound in on the control thread and asks the kernel to read ahead, so the audio thread doesn't wait on the disk. The audio thread gets orders through a lock-free queue and hands finished voices back through another, so it never allocates or frees. A press reads its sound from a table apart from the library, so saving never delays it.

## Hotkeys

Hotkeys go through the GlobalShortcuts portal, with `luft_app::shortcuts`. Each sound is a shortcut named `sound-ID`. Apps outside a sandbox name themselves with the portal's host registry first. Binding a shortcut without a preferred key needs no consent, and people pick the keys in Kestrel's own dialog, which `ConfigureShortcuts` opens. Kestrel only passes shortcuts on in normal use, so they do nothing on the lock screen, and it ignores key repeat, so a held key is one press.

A game that inhibits the desktop's shortcuts on Wayland also inhibits these.

## Testing

`cargo test -p soundboard` runs the mixer and the library on their own, and the engine against a private PipeWire, WirePlumber and pipewire-pulse with no hardware. Those tests print the time from a press to the sound reaching a listener, with nothing flowing and with a voice flowing, and what passing through adds to the voice.

`kestrel/tools/session.sh capture --only apps:soundboard` runs the built app in a headless session, where it plays a sound and records it from the virtual microphone. See [Testing](../testing.md).
