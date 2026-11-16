use std::env;
use std::os::fd::OwnedFd;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::mpsc::{self, Receiver};
use std::time::Instant;

use rustix::event::{EventfdFlags, PollFd, PollFlags, eventfd, poll};
use rustix::io::{read, write};

use crate::icons::Icons;
use crate::render::{Gpu, Scene, Target};
use crate::stats::Stats;
use crate::text::Text;
use crate::ui::{Element, Ui};
use crate::wayland::{Event, Wayland, Window};

const ESCAPE: u32 = 1;

/// A surface of the shell: state, the elements that show it and what
/// messages do to it.
pub trait App: 'static {
    type Message: Clone + Send + 'static;

    fn view(&self) -> Element<Self::Message>;
    fn update(&mut self, message: Self::Message, surface: &mut Surface);
}

/// Whether the surface is on screen.
#[derive(Default)]
pub struct Surface {
    open: bool,
}

impl Surface {
    pub fn is_open(&self) -> bool {
        self.open
    }

    pub fn open(&mut self) {
        self.open = true;
    }

    pub fn close(&mut self) {
        self.open = false;
    }
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

struct Shown {
    target: Option<Target>,
    window: Window,
    configured: bool,
    focused: bool,
    dirty: bool,
    awaiting_frame: bool,
    size: (i32, i32),
    stats: Stats,
}

/// Runs the app until the display goes away.
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
    let mut surface = Surface::default();
    let mut shown: Option<Shown> = None;
    let mut scale = 1.0_f32;
    let report = env::var_os("KESTREL_SHELL_STATS").is_some();
    let display = wayland
        .fd()
        .try_clone_to_owned()
        .expect("the display's socket");

    loop {
        let mut changed = false;
        while let Ok(message) = inbox.try_recv() {
            app.update(message, &mut surface);
            changed = true;
        }
        match (&mut shown, surface.open) {
            (None, true) => {
                shown = Some(Shown {
                    target: None,
                    window: Window::open(&wayland, options.app_id),
                    configured: false,
                    focused: false,
                    dirty: true,
                    awaiting_frame: false,
                    size: (0, 0),
                    stats: Stats::new(),
                });
            }
            (Some(open), false) => {
                if report {
                    open.stats.report();
                }
                shown = None;
                ui.reset();
            }
            (Some(open), true) => open.dirty |= changed,
            (None, false) => {}
        }

        if let Some(open) = &mut shown
            && open.configured
            && open.dirty
            && !open.awaiting_frame
        {
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
            let size = (options.width.round() as i32, frame.height.ceil() as i32);
            let pixels = (
                (size.0 as f32 * scale).round() as u32,
                (size.1 as f32 * scale).round() as u32,
            );
            if open.size != size {
                open.size = size;
                open.window.resize(&wayland, size.0, size.1);
            }
            match &mut open.target {
                Some(target) => gpu.resize(target, pixels.0, pixels.1),
                None => {
                    let (display, window) = open.window.handles(&wayland);
                    open.target = Some(unsafe { gpu.target(display, window, pixels.0, pixels.1) });
                }
            }
            open.window.request_frame(&wayland);
            gpu.draw(open.target.as_ref().expect("a target"), &scene);
            open.dirty = frame.animating;
            open.awaiting_frame = true;
            open.stats.frame(started.elapsed());
        }

        let events = wayland.exchange(|| {
            let mut ready = [
                PollFd::new(&display, PollFlags::IN),
                PollFd::new(&*wake, PollFlags::IN),
            ];
            poll(&mut ready, None).expect("something to wait for");
            if !ready[1].revents().is_empty() {
                let _ = read(&*wake, &mut [0; 8]);
            }
            !ready[0].revents().is_empty()
        });
        for event in events {
            let Some(open) = &mut shown else { break };
            let message = match event {
                Event::Configured { active } => {
                    if open.focused && !active {
                        surface.close();
                    }
                    open.focused = active;
                    open.configured = true;
                    None
                }
                Event::CloseRequested | Event::Key { code: ESCAPE } => {
                    surface.close();
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
                    open.awaiting_frame = false;
                    continue;
                }
                Event::Presented(at) => {
                    open.stats.presented(at);
                    continue;
                }
            };
            open.dirty = true;
            if let Some(message) = message {
                app.update(message, &mut surface);
            }
        }
    }
}
