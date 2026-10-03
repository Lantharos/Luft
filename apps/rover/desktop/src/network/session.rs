use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::mpsc;

use gio::glib;
use gio::prelude::*;
use luft_app::Events;
use serde::{Deserialize, Serialize};

use super::discover::{self, Place};
use super::mounts::{self, Location};
use crate::events::{NETWORK_ASK as ASK, NETWORK_CHANGED as CHANGED};

static NEXT_REQUEST: AtomicU32 = AtomicU32::new(1);

thread_local! {
    static WAITING: RefCell<HashMap<u32, gio::MountOperation>> = RefCell::new(HashMap::new());
}

#[derive(Clone)]
pub struct Session {
    context: glib::MainContext,
    events: Events,
}

#[derive(Serialize)]
#[serde(
    rename_all = "camelCase",
    rename_all_fields = "camelCase",
    tag = "kind"
)]
enum Ask {
    Password {
        id: u32,
        message: String,
        user: String,
        domain: String,
        needs_user: bool,
        needs_domain: bool,
        needs_password: bool,
        anonymous: bool,
        saving: bool,
    },
    Question {
        id: u32,
        message: String,
        choices: Vec<String>,
    },
    Done {
        id: u32,
    },
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Answer {
    id: u32,
    cancelled: bool,
    user: Option<String>,
    domain: Option<String>,
    password: Option<String>,
    anonymous: bool,
    remember: bool,
    choice: Option<i32>,
}

impl Session {
    pub fn start(events: Events) -> Self {
        let context = glib::MainContext::new();
        let session = Self {
            context: context.clone(),
            events: events.clone(),
        };
        std::thread::Builder::new()
            .name("network".into())
            .spawn(move || {
                context
                    .with_thread_default(|| {
                        let monitor = gio::VolumeMonitor::get();
                        let notify = move || {
                            events.emit(CHANGED, ());
                        };
                        let added = notify.clone();
                        monitor.connect_mount_added(move |_, _| added());
                        let removed = notify.clone();
                        monitor.connect_mount_removed(move |_, _| removed());
                        monitor.connect_mount_changed(move |_, _| notify());
                        glib::MainLoop::new(Some(&context), false).run();
                    })
                    .expect("the network thread owns its context");
            })
            .expect("the network thread starts");
        session
    }

    fn call<R: Send + 'static>(
        &self,
        work: impl FnOnce(mpsc::Sender<R>) + Send + 'static,
    ) -> Result<R, String> {
        let (sender, receiver) = mpsc::channel();
        self.context.invoke(move || work(sender));
        receiver
            .recv()
            .map_err(|_| "The network connection stopped".to_owned())
    }

    pub fn locations(&self) -> Vec<Location> {
        self.call(|reply| {
            let _ = reply.send(mounts::list());
        })
        .unwrap_or_default()
    }

    pub fn connect(&self, uri: String) -> Result<Location, String> {
        let events = self.events.clone();
        self.call(move |reply| {
            let file = gio::File::for_uri(&uri);
            let id = NEXT_REQUEST.fetch_add(1, Ordering::Relaxed);
            let operation = operation(id, events.clone());
            WAITING.with_borrow_mut(|waiting| waiting.insert(id, operation.clone()));
            let target = file.clone();
            file.mount_enclosing_volume(
                gio::MountMountFlags::NONE,
                Some(&operation),
                gio::Cancellable::NONE,
                move |result| {
                    WAITING.with_borrow_mut(|waiting| waiting.remove(&id));
                    events.emit(ASK, Ask::Done { id });
                    let mounted = match result {
                        Err(error) if !error.matches(gio::IOErrorEnum::AlreadyMounted) => {
                            Err(mounts::explain(&error))
                        }
                        _ => mounts::locate(&target),
                    };
                    let _ = reply.send(mounted);
                },
            );
        })?
    }

    pub fn answer(&self, answer: Answer) {
        self.context.invoke(move || {
            let Some(operation) = WAITING.with_borrow(|waiting| waiting.get(&answer.id).cloned())
            else {
                return;
            };
            if answer.cancelled {
                operation.reply(gio::MountOperationResult::Aborted);
                return;
            }
            if let Some(choice) = answer.choice {
                operation.set_choice(choice);
            }
            if let Some(user) = &answer.user {
                operation.set_username(Some(user));
            }
            if let Some(domain) = &answer.domain {
                operation.set_domain(Some(domain));
            }
            if let Some(password) = &answer.password {
                operation.set_password(Some(password));
            }
            operation.set_anonymous(answer.anonymous);
            operation.set_password_save(if answer.remember {
                gio::PasswordSave::Permanently
            } else {
                gio::PasswordSave::Never
            });
            operation.reply(gio::MountOperationResult::Handled);
        });
    }

    pub fn disconnect(&self, uri: String) -> Result<(), String> {
        self.call(move |reply| mounts::unmount(&uri, reply))?
    }

    pub fn discover(&self) -> Result<Vec<Place>, String> {
        self.call(discover::browse)?
    }
}

fn operation(id: u32, events: Events) -> gio::MountOperation {
    let operation = gio::MountOperation::new();
    let asking = events.clone();
    operation.connect_ask_password(move |_, message, user, domain, flags| {
        asking.emit(
            ASK,
            Ask::Password {
                id,
                message: message.to_owned(),
                user: user.to_owned(),
                domain: domain.to_owned(),
                needs_user: flags.contains(gio::AskPasswordFlags::NEED_USERNAME),
                needs_domain: flags.contains(gio::AskPasswordFlags::NEED_DOMAIN),
                needs_password: flags.contains(gio::AskPasswordFlags::NEED_PASSWORD),
                anonymous: flags.contains(gio::AskPasswordFlags::ANONYMOUS_SUPPORTED),
                saving: flags.contains(gio::AskPasswordFlags::SAVING_SUPPORTED),
            },
        );
    });
    operation.connect_local("ask-question", false, move |values| {
        let message = values
            .get(1)
            .and_then(|value| value.get::<String>().ok())
            .unwrap_or_default();
        let choices = values
            .get(2)
            .and_then(|value| value.get::<Vec<String>>().ok())
            .unwrap_or_default();
        events.emit(
            ASK,
            Ask::Question {
                id,
                message,
                choices,
            },
        );
        None
    });
    operation
}
