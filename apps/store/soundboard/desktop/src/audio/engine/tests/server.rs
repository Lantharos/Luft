use std::ffi::{OsStr, OsString};
use std::os::unix::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use pipewire as pw;
use pw::properties::properties;

use super::WAIT;
use crate::audio::{CHANNELS, RATE};

const QUIET: f32 = 0.02;
const CLICK: f32 = 0.3;
const CLICK_PERIOD: Duration = Duration::from_millis(100);
const POLL: Duration = Duration::from_millis(50);
const CONFIG: &str = r#"
context.properties = { default.clock.rate = 48000 default.clock.quantum = 1024 default.clock.min-quantum = 32 support.dbus = false core.daemon = true core.name = pipewire-0 }
context.spa-libs = { audio.convert.* = audioconvert/libspa-audioconvert support.* = support/libspa-support }
context.modules = [
  { name = libpipewire-module-protocol-native args = {} }
  { name = libpipewire-module-metadata }
  { name = libpipewire-module-client-node }
  { name = libpipewire-module-adapter }
  { name = libpipewire-module-link-factory }
  { name = libpipewire-module-spa-node-factory }
  { name = libpipewire-module-client-device }
  { name = libpipewire-module-session-manager }
  { name = libpipewire-module-access args = {} }
  { name = libpipewire-module-rt args = { nice.level = -11 rt.prio = 88 } flags = [ ifexists nofail ] }
]
context.objects = [
  { factory = spa-node-factory args = { factory.name = support.node.driver node.name = Dummy-Driver priority.driver = 200 } }
  { factory = spa-node-factory args = { factory.name = support.node.driver node.name = Freewheel-Driver priority.driver = 190 node.freewheel = true } }
  { factory = adapter args = { factory.name = support.null-audio-sink node.name = speakers node.description = Speakers media.class = Audio/Sink audio.position = [ FL FR ] monitor.channel-volumes = true } }
]
"#;
const PULSE: &str = r#"
context.properties = { support.dbus = false }
context.spa-libs = { audio.convert.* = audioconvert/libspa-audioconvert support.* = support/libspa-support }
context.modules = [
  { name = libpipewire-module-protocol-native }
  { name = libpipewire-module-client-node }
  { name = libpipewire-module-adapter }
  { name = libpipewire-module-metadata }
  { name = libpipewire-module-protocol-pulse args = { server.address = [ "unix:native" ] } }
]
"#;
const NO_HARDWARE: &str = r#"
wireplumber.profiles = { main = {
  hardware.audio = disabled
  hardware.bluetooth = disabled
  hardware.video-capture = disabled
  monitor.alsa = disabled
  monitor.bluez = disabled
  monitor.v4l2 = disabled
  monitor.libcamera = disabled
  support.portal-permissionstore = disabled
  support.reserve-device = disabled
  support.logind = disabled
  policy.standard = required
} }
"#;

const FOLDER: &str = "SOUNDBOARD_TEST_SERVER";

fn environment(folder: &Path) -> [(&'static str, OsString); 8] {
    let path = |name: &str| folder.join(name).into_os_string();
    let mut pulse = OsString::from("unix:");
    pulse.push(path("pulse/native"));
    [
        (FOLDER, folder.as_os_str().to_owned()),
        ("XDG_RUNTIME_DIR", path("run")),
        ("PIPEWIRE_RUNTIME_DIR", path("run")),
        ("PIPEWIRE_REMOTE", "pipewire-0".into()),
        ("PULSE_SERVER", pulse),
        ("XDG_CONFIG_HOME", path("config")),
        ("XDG_STATE_HOME", path("state")),
        ("PULSE_RUNTIME_PATH", path("pulse")),
    ]
}

/// Runs the calling test against a sound server of its own, in a process
/// that starts with that server's environment.
pub fn on_own_server(body: impl FnOnce(&Server)) {
    match std::env::var_os(FOLDER) {
        Some(folder) => {
            pw::init();
            body(&Server {
                folder: folder.into(),
            });
        }
        None => Daemons::start().run(std::thread::current().name().unwrap()),
    }
}

fn spawn_tied(command: &mut Command) -> Child {
    // SAFETY: prctl is safe to call between fork and exec.
    unsafe {
        command.pre_exec(|| {
            libc::prctl(libc::PR_SET_PDEATHSIG, libc::SIGKILL);
            Ok(())
        });
    }
    command
        .spawn()
        .expect("pipewire, wireplumber and pw-dump are installed")
}

struct Daemons {
    folder: tempfile::TempDir,
    running: Vec<Child>,
}

impl Daemons {
    fn start() -> Self {
        let folder = tempfile::tempdir().unwrap();
        let path = |name: &str| folder.path().join(name);
        for sub in [
            "run",
            "config/wireplumber/wireplumber.conf.d",
            "state",
            "pulse",
        ] {
            std::fs::create_dir_all(path(sub)).unwrap();
        }
        std::fs::write(path("pipewire.conf"), CONFIG).unwrap();
        std::fs::write(path("pipewire-pulse.conf"), PULSE).unwrap();
        std::fs::write(
            path("config/wireplumber/wireplumber.conf.d/99-no-hardware.conf"),
            NO_HARDWARE,
        )
        .unwrap();
        let mut daemons = Self {
            folder,
            running: Vec::new(),
        };
        daemons.spawn("pipewire", Some("pipewire.conf"));
        wait_until("the sound server starts", || {
            daemons.folder.path().join("run/pipewire-0").exists()
        });
        daemons.spawn("wireplumber", None);
        daemons.spawn("pipewire", Some("pipewire-pulse.conf"));
        wait_until("the PulseAudio side starts", || {
            daemons.folder.path().join("pulse/native").exists()
        });
        let server = Server {
            folder: daemons.folder.path().to_owned(),
        };
        wait_until("the session manager takes over", || {
            server.dump().contains("default.audio.sink")
        });
        daemons
    }

    fn command(&self, program: impl AsRef<OsStr>) -> Command {
        let mut command = Command::new(program);
        command
            .envs(environment(self.folder.path()))
            .env_remove("DBUS_SESSION_BUS_ADDRESS");
        command
    }

    fn spawn(&mut self, program: &str, conf: Option<&str>) {
        let mut command = self.command(program);
        if let Some(conf) = conf {
            command.arg("-c").arg(self.folder.path().join(conf));
        }
        self.running.push(spawn_tied(command.stdout(Stdio::null())));
    }

    fn run(&self, test: &str) {
        let output = self
            .command(std::env::current_exe().unwrap())
            .args(["--exact", test, "--nocapture"])
            .output()
            .unwrap();
        let printed = String::from_utf8_lossy(&output.stdout);
        print!("{printed}");
        eprint!("{}", String::from_utf8_lossy(&output.stderr));
        assert!(
            output.status.success() && printed.contains("1 passed"),
            "{test} failed on its own sound server"
        );
    }
}

impl Drop for Daemons {
    fn drop(&mut self) {
        for daemon in &mut self.running {
            let _ = daemon.kill();
            let _ = daemon.wait();
        }
    }
}

pub struct Server {
    folder: PathBuf,
}

impl Server {
    fn dump(&self) -> String {
        let output = Command::new("pw-dump")
            .envs(environment(&self.folder))
            .output()
            .unwrap();
        String::from_utf8_lossy(&output.stdout).into_owned()
    }

    pub fn has_source(&self, name: &str) -> bool {
        let objects: serde_json::Value = serde_json::from_str(&self.dump()).unwrap_or_default();
        objects.as_array().into_iter().flatten().any(|object| {
            let props = &object["info"]["props"];
            props["media.class"] == "Audio/Source" && props["node.name"] == name
        })
    }

    pub fn default_source(&self) -> Option<String> {
        let objects: serde_json::Value = serde_json::from_str(&self.dump()).unwrap_or_default();
        objects
            .as_array()?
            .iter()
            .find(|object| object["props"]["metadata.name"] == "default")?["metadata"]
            .as_array()?
            .iter()
            .find(|entry| entry["key"] == "default.audio.source")?["value"]["name"]
            .as_str()
            .map(str::to_owned)
    }

    pub fn speak(&self, level: f32) -> FakeMicrophone {
        FakeMicrophone::start(self, "fake-mic", Pattern::Hum(level))
    }

    pub fn click_track(&self) -> FakeMicrophone {
        FakeMicrophone::start(self, "fake-mic", Pattern::Clicks)
    }

    pub fn killable_engine(&self) -> Child {
        let (_crate, module) = module_path!().split_once("::").unwrap();
        let program = std::env::current_exe().unwrap();
        spawn_tied(
            Command::new(program)
                .args([
                    "--exact",
                    &format!("{module}::engine_until_killed"),
                    "--ignored",
                ])
                .stdout(Stdio::null()),
        )
    }
}

#[test]
#[ignore = "the process other tests start in order to kill it"]
fn engine_until_killed() {
    if std::env::var_os(FOLDER).is_none() {
        return;
    }
    let _engine = super::Engine::start(super::Mix::default(), |_| {});
    std::thread::sleep(Duration::from_secs(600));
}

pub fn wait_until(what: &str, done: impl Fn() -> bool) {
    let deadline = Instant::now() + WAIT;
    while !done() {
        assert!(Instant::now() < deadline, "timed out waiting until {what}");
        std::thread::sleep(POLL);
    }
}

#[derive(Clone, Copy)]
enum Pattern {
    Hum(f32),
    Clicks,
}

pub struct FakeMicrophone {
    pub name: String,
    quit: pw::channel::Sender<()>,
    thread: Option<std::thread::JoinHandle<()>>,
}

impl FakeMicrophone {
    fn start(server: &Server, name: &str, pattern: Pattern) -> Self {
        let (quit, receiver) = pw::channel::channel();
        let node = name.to_owned();
        let thread = std::thread::spawn(move || {
            let mainloop = pw::main_loop::MainLoopRc::new(None).unwrap();
            let context = pw::context::ContextRc::new(&mainloop, None).unwrap();
            let core = context.connect_rc(None).unwrap();
            let props = properties! {
                *pw::keys::MEDIA_CLASS => "Audio/Source",
                *pw::keys::NODE_NAME => node.as_str(),
                *pw::keys::NODE_DESCRIPTION => "Fake microphone",
                *pw::keys::NODE_LATENCY => "256/48000",
            };
            let stream = pw::stream::StreamBox::new(&core, "fake", props).unwrap();
            let _listener = stream
                .add_local_listener_with_user_data(0usize)
                .process(move |stream, position| {
                    let Some(mut buffer) = stream.dequeue_buffer() else {
                        return;
                    };
                    let requested = buffer.requested() as usize;
                    let data = buffer.datas_mut().first_mut().unwrap();
                    let bytes = data.data().unwrap();
                    let frames = requested.min(bytes.len() / (CHANNELS * 4));
                    let (_, samples, _) =
                        unsafe { bytes[..frames * CHANNELS * 4].align_to_mut::<f32>() };
                    for frame in samples.as_chunks_mut::<CHANNELS>().0 {
                        frame.fill(match pattern {
                            Pattern::Hum(level) => level,
                            Pattern::Clicks if *position % (RATE as usize / 10) < 8 => 0.9,
                            Pattern::Clicks => 0.0,
                        });
                        *position += 1;
                    }
                    let chunk = data.chunk_mut();
                    *chunk.stride_mut() = (CHANNELS * 4) as i32;
                    *chunk.size_mut() = (frames * CHANNELS * 4) as u32;
                })
                .register()
                .unwrap();
            connect(&stream, pw::spa::utils::Direction::Output);
            let stop = mainloop.clone();
            let _quit = receiver.attach(mainloop.loop_(), move |()| stop.quit());
            mainloop.run();
        });
        wait_until("the fake microphone appears", || server.has_source(name));
        Self {
            name: name.to_owned(),
            quit,
            thread: Some(thread),
        }
    }
}

impl Drop for FakeMicrophone {
    fn drop(&mut self) {
        let _ = self.quit.send(());
        let _ = self.thread.take().unwrap().join();
    }
}

fn connect(stream: &pw::stream::Stream, direction: pw::spa::utils::Direction) {
    let format = crate::audio::engine::streams::format_pod().unwrap();
    let pod = pw::spa::pod::Pod::from_bytes(&format).unwrap();
    stream
        .connect(
            direction,
            None,
            pw::stream::StreamFlags::AUTOCONNECT
                | pw::stream::StreamFlags::MAP_BUFFERS
                | pw::stream::StreamFlags::RT_PROCESS,
            &mut [pod],
        )
        .unwrap();
}

fn audio_time(frames: u64) -> Duration {
    Duration::from_secs_f64(frames as f64 / f64::from(RATE))
}

#[derive(Default)]
struct Heard {
    samples: Vec<f32>,
    armed_at: Option<usize>,
    first: Option<usize>,
    clicks: Vec<Duration>,
    since_loud: usize,
}

impl Heard {
    fn frames(&self) -> usize {
        self.samples.len() / CHANNELS
    }

    fn note_first_sound(&mut self, samples: &[f32]) {
        let Some(armed_at) = self.armed_at.filter(|_| self.first.is_none()) else {
            return;
        };
        if let Some(index) = samples.iter().position(|sample| sample.abs() > QUIET) {
            self.first = Some(self.frames() + index / CHANNELS - armed_at);
        }
    }

    fn note_clicks(&mut self, samples: &[f32], cycle: Duration) {
        for (index, frame) in samples.as_chunks::<CHANNELS>().0.iter().enumerate() {
            if frame[0].abs() > CLICK {
                if self.since_loud > RATE as usize / 40 {
                    self.clicks.push(cycle + audio_time(index as u64));
                }
                self.since_loud = 0;
            } else {
                self.since_loud += 1;
            }
        }
    }
}

pub struct Listener {
    heard: Arc<Mutex<Heard>>,
    quit: pw::channel::Sender<()>,
    thread: Option<std::thread::JoinHandle<()>>,
}

impl Listener {
    pub fn on(source: &str) -> Self {
        let (quit, receiver) = pw::channel::channel();
        let heard = Arc::new(Mutex::new(Heard {
            armed_at: Some(0),
            ..Heard::default()
        }));
        let writer = heard.clone();
        let target = source.to_owned();
        let thread = std::thread::spawn(move || {
            let mainloop = pw::main_loop::MainLoopRc::new(None).unwrap();
            let context = pw::context::ContextRc::new(&mainloop, None).unwrap();
            let core = context.connect_rc(None).unwrap();
            let props = properties! {
                *pw::keys::MEDIA_TYPE => "Audio",
                *pw::keys::MEDIA_CATEGORY => "Capture",
                *pw::keys::NODE_LATENCY => "256/48000",
                "target.object" => target.as_str(),
            };
            let stream = pw::stream::StreamBox::new(&core, "listener", props).unwrap();
            let _listener = stream
                .add_local_listener_with_user_data(writer)
                .process(|stream, heard| {
                    let cycle = stream.time().map_or(Duration::ZERO, |time| {
                        Duration::from_nanos(time.now().unsigned_abs())
                    });
                    let Some(mut buffer) = stream.dequeue_buffer() else {
                        return;
                    };
                    let data = buffer.datas_mut().first_mut().unwrap();
                    let size = data.chunk().size() as usize;
                    let bytes = data.data().unwrap();
                    let (_, samples, _) = unsafe { bytes[..size].align_to::<f32>() };
                    let mut heard = heard.lock().unwrap();
                    heard.note_first_sound(samples);
                    heard.note_clicks(samples, cycle);
                    heard.samples.extend_from_slice(samples);
                })
                .register()
                .unwrap();
            connect(&stream, pw::spa::utils::Direction::Input);
            let stop = mainloop.clone();
            let _quit = receiver.attach(mainloop.loop_(), move |()| stop.quit());
            mainloop.run();
        });
        Self {
            heard,
            quit,
            thread: Some(thread),
        }
    }

    pub fn rearm(&self) {
        let mut heard = self.heard.lock().unwrap();
        heard.armed_at = Some(heard.frames());
        heard.first = None;
    }

    /// How much sound went by between arming and the first loud sample.
    pub fn first_sound(&self, within: Duration) -> Option<Duration> {
        let deadline = Instant::now() + within;
        while Instant::now() < deadline {
            if let Some(first) = self.heard.lock().unwrap().first {
                return Some(audio_time(first as u64));
            }
            std::thread::sleep(Duration::from_micros(200));
        }
        None
    }

    pub fn samples(&self) -> Vec<f32> {
        self.heard.lock().unwrap().samples.clone()
    }

    pub fn peak(&self) -> f32 {
        let heard = self.heard.lock().unwrap();
        let recent = heard.samples.len().saturating_sub(RATE as usize / 4);
        heard.samples[recent..]
            .iter()
            .fold(0f32, |peak, sample| peak.max(sample.abs()))
    }

    /// How much later, by the sound server's clock, each click the direct
    /// listener heard reached the other one.
    pub fn delays(direct: &Self, through: &Self) -> Vec<Duration> {
        let first = direct.heard.lock().unwrap().clicks.clone();
        let second = through.heard.lock().unwrap().clicks.clone();
        first
            .iter()
            .skip(1)
            .filter_map(|click| {
                let matching = second
                    .iter()
                    .find(|other| click.abs_diff(**other) < CLICK_PERIOD / 2)?;
                Some(matching.saturating_sub(*click))
            })
            .collect()
    }
}

impl Drop for Listener {
    fn drop(&mut self) {
        let _ = self.quit.send(());
        let _ = self.thread.take().unwrap().join();
    }
}
