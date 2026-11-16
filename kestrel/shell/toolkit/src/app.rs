use std::env;
use std::os::fd::OwnedFd;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::mpsc::{self, Receiver};
use std::time::{Duration, Instant};

use rustix::event::{EventfdFlags, PollFd, PollFlags, Timespec, eventfd, poll};
use rustix::io::{read, write};

use crate::icons::Icons;
use crate::render::{Gpu, Scene, Target};
use crate::stats::Stats;
use crate::text::Text;
use crate::ui::{Element, Ui};
use crate::wayland::{Event, Wayland, Window};

const ESCAPE: u32 = 1;
const UNSEEN_FRAME: Duration = Duration::from_millis(100);

/// A surface of the shell: state, the elements that show it and what
/// messages do to it.
pub trait App: 'static {
    type Message: Clone + Send + 'static;

    fn view(&self) -> Element<Self::Message>;
    fn update(&mut self, message: Self::Message);
}

/// Hands messages to the app from other threads.
pub struct Sender<M> {
    messages: mpsc::Sender<M>,
    wake: Arc<OwnedFd>,
}

impl<M> Clone for Sender<M> {
    fn clone(&self) -> Self {
        Self {
            messages: self.messages.clone(),
            wake: self.wake.clone(),
        }
    }
}

impl<M> Sender<M> {
    pub fn send(&self, message: M) {
        if self.messages.send(message).is_ok() {
            let _ = write(&*self.wake, &1_u64.to_ne_bytes());
        }
    }
}

pub struct Options {
    pub app_id: &'static str,
    pub width: f32,
    pub icons: Vec<PathBuf>,
}

/// Runs the app until the display goes away. Its surface lives the whole
/// time: Kestrel shows and hides it, and it stays drawn while hidden so it is
/// there the moment it is shown.
pub fn run<A: App>(options: Options, start: impl FnOnce(Sender<A::Message>) -> A) -> ! {
    let mut wayland = Wayland::connect();
    let mut gpu = Gpu::new();
    let mut text = Text::new();
    let mut icons = Icons::new(options.icons);
    let mut scene = Scene::default();
    let mut ui = Ui::new();
    let (messages, inbox): (_, Receiver<A::Message>) = mpsc::channel();
    let wake =
        Arc::new(eventfd(0, EventfdFlags::CLOEXEC | EventfdFlags::NONBLOCK).expect("an eventfd"));
    let mut app = start(Sender {
        messages,
        wake: wake.clone(),
    });
    let display = wayland
        .fd()
        .try_clone_to_owned()
        .expect("the display's socket");
    let report = env::var_os("KESTREL_SHELL_STATS").is_some();

    let mut target: Option<Target> = None;
    let window = Window::open(&wayland, options.app_id);
    let mut scale = 1.0_f32;
    let mut size = (0, 0);
    let mut configured = false;
    let mut focused = false;
    let mut dirty = true;
    let mut awaited: Option<Instant> = None;
    let mut stats = Stats::default();

    loop {
        while let Ok(message) = inbox.try_recv() {
            app.update(message);
            dirty = true;
        }

        let unseen = awaited.is_some_and(|since| since.elapsed() >= UNSEEN_FRAME);
        if configured && dirty && (awaited.is_none() || unseen) {
            let started = Instant::now();
            let root = app.view();
            let frame = ui.frame(
                &root,
                options.width,
                scale,
                &mut text,
                &mut icons,
                &mut gpu,
                &mut scene,
            );
            let logical = (options.width.round() as i32, frame.height.ceil() as i32);
            let pixels = (
                (logical.0 as f32 * scale).round() as u32,
                (logical.1 as f32 * scale).round() as u32,
            );
            if size != logical {
                size = logical;
                window.resize(&wayland, logical.0, logical.1);
            }
            match &mut target {
                Some(target) => gpu.resize(target, pixels.0, pixels.1),
                None => {
                    let (display, surface) = window.handles(&wayland);
                    target = Some(unsafe { gpu.target(display, surface, pixels.0, pixels.1) });
                }
            }
            window.request_frame(&wayland);
            gpu.draw(target.as_ref().expect("a target"), &scene);
            dirty = frame.animating;
            awaited = Some(started);
            stats.frame(started.elapsed());
        }

        let patience = (dirty && !unseen)
            .then(|| awaited.map(|since| UNSEEN_FRAME.saturating_sub(since.elapsed())))
            .flatten();
        let events = wayland.exchange(|| {
            let mut ready = [
                PollFd::new(&display, PollFlags::IN),
                PollFd::new(&*wake, PollFlags::IN),
            ];
            let timeout = patience.map(|patience| Timespec {
                tv_sec: 0,
                tv_nsec: patience.as_nanos() as i64,
            });
            poll(&mut ready, timeout.as_ref()).expect("something to wait for");
            if !ready[1].revents().is_empty() {
                let _ = read(&*wake, &mut [0; 8]);
            }
            !ready[0].revents().is_empty()
        });
        for event in events {
            let message = match event {
                Event::Configured { active } => {
                    if focused && !active {
                        window.hide();
                        ui.reset();
                        if report {
                            stats.report();
                        }
                        stats = Stats::default();
                    }
                    focused = active;
                    configured = true;
                    None
                }
                Event::CloseRequested | Event::Key { code: ESCAPE } => {
                    window.hide();
                    None
                }
                Event::Key { .. } => None,
                Event::Scale(preferred) => {
                    scale = preferred;
                    None
                }
                Event::PointerMoved(x, y) => ui.pointer_moved(x, y),
                Event::PointerLeft => {
                    ui.pointer_left();
                    None
                }
                Event::Pressed => ui.pressed(),
                Event::Released => ui.released(),
                Event::FrameDone => {
                    awaited = None;
                    continue;
                }
                Event::Presented(at) => {
                    stats.presented(at);
                    continue;
                }
            };
            dirty = true;
            if let Some(message) = message {
                app.update(message);
            }
        }
    }
}
