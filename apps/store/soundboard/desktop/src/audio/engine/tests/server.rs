use std::os::unix::process::CommandExt;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::sync::{Arc, LazyLock};
use std::time::{Duration, Instant};

use pipewire as pw;
use pw::properties::properties;

use super::WAIT;
use crate::audio::{CHANNELS, RATE};

const QUIET: f32 = 0.02;
const CLICK: f32 = 0.3;
const CLICK_PERIOD: Duration = Duration::from_millis(100);
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

pub static SERVER: LazyLock<Server> = LazyLock::new(|| {
    let (started, server) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        started.send(Server::start()).unwrap();
        std::thread::park();
    });
    server.recv().unwrap()
});

fn spawn_tied(command: &mut Command) -> Child {
    // SAFETY: prctl is safe to call between fork and exec.
    unsafe {
        command.pre_exec(|| {
            libc::prctl(libc::PR_SET_PDEATHSIG, libc::SIGKILL);
            Ok(())
        });
    }
    command.spawn().unwrap()
}

pub struct Server {
    folder: tempfile::TempDir,
    _daemons: Mutex<Vec<Child>>,
}

impl Server {
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
        // SAFETY: this runs once, before the test binary starts anything that reads the environment.
        unsafe {
            std::env::set_var("XDG_RUNTIME_DIR", path("run"));
            std::env::set_var("PIPEWIRE_RUNTIME_DIR", path("run"));
            std::env::set_var("PIPEWIRE_REMOTE", "pipewire-0");
            std::env::set_var(
                "PULSE_SERVER",
                format!("unix:{}", path("pulse/native").display()),
            );
            std::env::set_var("XDG_CONFIG_HOME", path("config"));
            std::env::set_var("XDG_STATE_HOME", path("state"));
            std::env::set_var("PULSE_RUNTIME_PATH", path("pulse"));
            std::env::remove_var("DBUS_SESSION_BUS_ADDRESS");
        }
        let daemon = |program: &str, conf: Option<PathBuf>| {
            let mut command = Command::new(program);
            if let Some(conf) = conf {
                command.arg("-c").arg(conf);
            }
            spawn_tied(command.stdout(Stdio::null()))
        };
        let mut daemons = vec![daemon("pipewire", Some(path("pipewire.conf")))];
        wait_until("the sound server starts", || {
            path("run/pipewire-0").exists()
        });
        daemons.push(daemon("wireplumber", None));
        daemons.push(daemon("pipewire", Some(path("pipewire-pulse.conf"))));
        wait_until("the PulseAudio side starts", || {
            path("pulse/native").exists()
        });
        pw::init();
        let server = Self {
            folder,
            _daemons: Mutex::new(daemons),
        };
        wait_until("the session manager takes over", || {
            server.dump().contains("default.audio.sink")
        });
        server
    }

    fn dump(&self) -> String {
        let output = Command::new("pw-dump").output().unwrap();
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
        FakeMicrophone::start("fake-mic", Pattern::Hum(level))
    }

    pub fn click_track(&self) -> FakeMicrophone {
        FakeMicrophone::start("fake-mic", Pattern::Clicks)
    }

    pub fn killable_engine(&self) -> Child {
        let program = std::env::current_exe().unwrap();
        spawn_tied(
            Command::new(program)
                .args([
                    "--exact",
                    "audio::engine::tests::server::engine_until_killed",
                    "--ignored",
                    "--nocapture",
                ])
                .env("SOUNDBOARD_TEST_SERVER", self.folder.path())
                .stdout(Stdio::null()),
        )
    }
}

#[test]
#[ignore = "the process other tests start in order to kill it"]
fn engine_until_killed() {
    let folder = PathBuf::from(std::env::var("SOUNDBOARD_TEST_SERVER").unwrap());
    // SAFETY: nothing else runs in this process yet.
    unsafe { std::env::set_var("PIPEWIRE_RUNTIME_DIR", folder.join("run")) };
    let _engine = super::Engine::start(super::Mix::default(), |_| {});
    std::thread::sleep(Duration::from_secs(600));
}

pub fn wait_until(what: &str, done: impl Fn() -> bool) {
    let deadline = Instant::now() + WAIT;
    while !done() {
        assert!(Instant::now() < deadline, "timed out waiting until {what}");
        std::thread::sleep(Duration::from_millis(5));
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
    fn start(name: &str, pattern: Pattern) -> Self {
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
        wait_until("the fake microphone appears", || SERVER.has_source(name));
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

#[derive(Default)]
struct Heard {
    samples: Vec<f32>,
    armed: bool,
    first: Option<Instant>,
    clicks: Vec<Instant>,
    since_loud: usize,
}

impl Heard {
    fn note_clicks(&mut self, samples: &[f32], arrived: Instant) {
        let frames = samples.len() / CHANNELS;
        for (index, frame) in samples.as_chunks::<CHANNELS>().0.iter().enumerate() {
            if frame[0].abs() > CLICK {
                if self.since_loud > RATE as usize / 40 {
                    let later = Duration::from_secs_f64((frames - index) as f64 / f64::from(RATE));
                    self.clicks.push(arrived - later);
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
            armed: true,
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
                    let Some(mut buffer) = stream.dequeue_buffer() else {
                        return;
                    };
                    let data = buffer.datas_mut().first_mut().unwrap();
                    let size = data.chunk().size() as usize;
                    let bytes = data.data().unwrap();
                    let (_, samples, _) = unsafe { bytes[..size].align_to::<f32>() };
                    let now = Instant::now();
                    let mut heard = heard.lock().unwrap();
                    if heard.armed && samples.iter().any(|sample| sample.abs() > QUIET) {
                        heard.armed = false;
                        heard.first = Some(now);
                    }
                    heard.samples.extend_from_slice(samples);
                    heard.note_clicks(samples, now);
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
        heard.armed = true;
        heard.first = None;
    }

    pub fn first_sound(&self, within: Duration) -> Option<Instant> {
        let deadline = Instant::now() + within;
        while Instant::now() < deadline {
            if let Some(first) = self.heard.lock().unwrap().first {
                return Some(first);
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

    pub fn delays(direct: &Self, through: &Self) -> Vec<Duration> {
        std::thread::sleep(Duration::from_millis(1500));
        let first = direct.heard.lock().unwrap().clicks.clone();
        let second = through.heard.lock().unwrap().clicks.clone();
        first
            .iter()
            .skip(1)
            .filter_map(|click| {
                let matching = second.iter().find(|other| {
                    other.saturating_duration_since(*click) < CLICK_PERIOD / 2
                        && click.saturating_duration_since(**other) < CLICK_PERIOD / 2
                })?;
                Some(matching.saturating_duration_since(*click))
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
