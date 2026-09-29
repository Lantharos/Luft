use std::cell::RefCell;
use std::path::PathBuf;
use std::thread;
use std::time::Duration;

use gio::glib;
use gio::prelude::*;
use luft_app::Events;

use crate::events::FOLDER_CHANGED;

const SETTLE: Duration = Duration::from_millis(150);

#[derive(Default)]
struct Watch {
    monitor: Option<gio::FileMonitor>,
    pending: Option<glib::SourceId>,
}

thread_local! {
    static WATCH: RefCell<Watch> = RefCell::default();
}

#[derive(Clone)]
pub struct FolderWatcher {
    context: glib::MainContext,
    events: Events,
}

impl FolderWatcher {
    pub fn new(events: Events) -> Self {
        let context = glib::MainContext::new();
        let running = context.clone();
        thread::spawn(move || {
            let _ = running.with_thread_default(|| {
                glib::MainLoop::new(Some(&running), false).run();
            });
        });
        Self { context, events }
    }

    pub fn watch(&self, folder: PathBuf) {
        let events = self.events.clone();
        self.context.invoke(move || {
            WATCH.with_borrow_mut(|watch| {
                if let Some(pending) = watch.pending.take() {
                    pending.remove();
                }
                watch.monitor = gio::File::for_path(&folder)
                    .monitor_directory(gio::FileMonitorFlags::WATCH_MOVES, gio::Cancellable::NONE)
                    .ok();
                if let Some(monitor) = &watch.monitor {
                    monitor.connect_changed(move |_, _, _, event| {
                        if changes_listing(event) {
                            schedule(folder.clone(), events.clone());
                        }
                    });
                }
            });
        });
    }
}

fn changes_listing(event: gio::FileMonitorEvent) -> bool {
    matches!(
        event,
        gio::FileMonitorEvent::ChangesDoneHint
            | gio::FileMonitorEvent::Deleted
            | gio::FileMonitorEvent::Created
            | gio::FileMonitorEvent::Renamed
            | gio::FileMonitorEvent::MovedIn
            | gio::FileMonitorEvent::MovedOut
    )
}

fn schedule(folder: PathBuf, events: Events) {
    WATCH.with_borrow_mut(|watch| {
        if watch.pending.is_some() {
            return;
        }
        watch.pending = Some(glib::timeout_add_local_once(SETTLE, move || {
            WATCH.with_borrow_mut(|watch| watch.pending = None);
            if let Ok(listing) = super::list(&folder) {
                events.emit(FOLDER_CHANGED, listing);
            }
        }));
    });
}
