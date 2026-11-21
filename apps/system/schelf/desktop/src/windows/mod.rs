mod install;

use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::{Arc, Mutex, MutexGuard, OnceLock};

use luft_app::launch::TOKEN_VARIABLES;
use luft_app::{Activation, Commands, Empty};
use luft_i18n::t;
use sabine::{BridgeEvent, PlatformEvent, SabineProcessHandle, SabineWindow, SingleInstancePolicy};

use crate::l10n::L10N;
use crate::operations::Queue;

const APP_ID: &str = "com.lantharos.schelf";
const PAGE_SCHEME: &str = "schelf:";
const PAGE: BridgeEvent<()> = BridgeEvent::new("schelf.page");

/// Schelf's windows: the main one, which opens when Schelf is started without
/// a file, and an install window for each file it's opened with. Schelf runs
/// until they're all closed and nothing is left in its queue.
#[derive(Clone)]
pub struct Windows(Arc<Inner>);

struct Inner {
    queue: Queue,
    events: luft_app::Events,
    process: OnceLock<SabineProcessHandle>,
    last_request: AtomicU32,
    open: Mutex<Open>,
}

#[derive(Default)]
struct Open {
    main: bool,
    installs: HashMap<u32, String>,
    dialogs: HashMap<u32, install::Dialog>,
    page: Option<String>,
}

fn file_title(path: &str) -> String {
    std::path::Path::new(path)
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
        .unwrap_or_default()
}

fn launch_token() -> Option<String> {
    TOKEN_VARIABLES
        .iter()
        .find_map(|variable| std::env::var(variable).ok())
        .filter(|token| !token.is_empty())
}

impl Windows {
    pub fn new(queue: Queue, events: luft_app::Events) -> Self {
        Self(Arc::new(Inner {
            queue,
            events,
            process: OnceLock::new(),
            last_request: AtomicU32::new(0),
            open: Mutex::new(Open::default()),
        }))
    }

    fn open(&self) -> MutexGuard<'_, Open> {
        self.0
            .open
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }

    fn next_request(&self) -> u32 {
        self.0.last_request.fetch_add(1, Ordering::Relaxed) + 1
    }

    fn process(&self) -> &SabineProcessHandle {
        self.0
            .process
            .get()
            .expect("Schelf opens windows once it launched")
    }

    pub fn take_page(&self) -> Option<String> {
        self.open().page.take()
    }

    fn attach(&self, process: SabineProcessHandle) {
        let _ = self.0.process.set(process);
        let windows = self.clone();
        std::thread::spawn(move || {
            windows.activate(&Activation::current_process(), launch_token())
        });
    }

    fn activate(&self, activation: &Activation, token: Option<String>) {
        let files: Vec<String> = activation
            .paths()
            .filter(|path| path.is_file())
            .map(|path| path.to_string_lossy().into_owned())
            .collect();
        let page = activation
            .arguments()
            .iter()
            .find(|argument| argument.starts_with(PAGE_SCHEME))
            .cloned();
        for file in &files {
            if let Err(error) = self.open_installer(file.clone()) {
                eprintln!("Schelf can't open a window for {file}: {error}");
            }
        }
        if page.is_some() || files.is_empty() {
            self.show(page, token);
        }
    }

    fn show(&self, page: Option<String>, token: Option<String>) {
        {
            let mut open = self.open();
            open.main = true;
            if page.is_some() {
                open.page = page;
            }
        }
        self.process().present(token);
        self.0.events.emit(PAGE, ());
    }

    fn open_installer(&self, path: String) -> Result<(), String> {
        let request = self.next_request();
        let title = file_title(&path);
        self.open().installs.insert(request, path);
        let closed = self.clone();
        let window = SabineWindow::for_current_app()
            .map(|window| install::window(window, &title, request))
            .map(|window| window.on_closed(move |_| closed.forget_installer(request)))
            .map_err(|error| error.to_string())?;
        self.process()
            .open_window(window)
            .map(drop)
            .map_err(|error| {
                self.forget_installer(request);
                error.to_string()
            })
    }

    fn installer(&self, request: u32) -> Result<String, String> {
        self.open()
            .installs
            .get(&request)
            .cloned()
            .ok_or_else(|| t!(L10N, "desktop-window-closed"))
    }

    fn forget_installer(&self, request: u32) {
        self.open().installs.remove(&request);
        self.quit_once_settled();
    }

    fn main_closed(&self) {
        self.open().main = false;
        self.quit_once_settled();
    }

    fn quit_once_settled(&self) {
        let idle = |open: &Open| !open.main && open.installs.is_empty();
        if !idle(&self.open()) {
            return;
        }
        let windows = self.clone();
        std::thread::spawn(move || {
            windows.0.queue.wait_until_settled();
            let open = windows.open();
            if idle(&open) {
                windows.process().quit();
            }
        });
    }

    pub fn register(&self, window: SabineWindow) -> SabineWindow {
        let attached = self.clone();
        let activated = self.clone();
        let closed = self.clone();
        let window = window
            .background()
            .single_instance_id(APP_ID)
            .single_instance(SingleInstancePolicy::ReuseExisting)
            .on_launched(move |process| attached.attach(process))
            .on_desktop_event(move |_, event| {
                if let PlatformEvent::SingleInstance(activation) = event {
                    activated.activate(
                        &Activation::from(activation),
                        activation.activation_token.clone(),
                    );
                }
            })
            .on_closed(move |_| closed.main_closed())
            .bridge_event(&PAGE)
            .with(
                "app_page",
                self,
                |windows, Empty {}| Ok(windows.take_page()),
            );
        install::register(window, self)
    }
}
