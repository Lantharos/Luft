use std::sync::mpsc;
use std::thread;

use gio::prelude::*;
use kestrel_toolkit::app::Sender;

use crate::Message;

const INTERFACE: &str = "org.gnome.desktop.interface";
const NOTIFICATIONS: &str = "org.gnome.desktop.notifications";
const SCHEME: &str = "color-scheme";
const BANNERS: &str = "show-banners";
const DARK: &str = "prefer-dark";

/// The desktop settings quick settings shows and changes, read on a thread
/// of their own where their change signals arrive.
pub struct Settings {
    context: glib::MainContext,
}

impl Settings {
    pub fn watch(messages: Sender<Message>) -> Self {
        let (ready, context) = mpsc::channel();
        thread::spawn(move || {
            let context = glib::MainContext::new();
            ready
                .send(context.clone())
                .expect("someone waiting for the settings");
            context
                .with_thread_default(|| {
                    let interface = gio::Settings::new(INTERFACE);
                    let notifications = gio::Settings::new(NOTIFICATIONS);
                    let dark = {
                        let messages = messages.clone();
                        move |settings: &gio::Settings| {
                            messages.send(Message::Dark(settings.string(SCHEME) == DARK))
                        }
                    };
                    let quiet = move |settings: &gio::Settings| {
                        messages.send(Message::Quiet(!settings.boolean(BANNERS)))
                    };
                    dark(&interface);
                    quiet(&notifications);
                    interface.connect_changed(Some(SCHEME), move |settings, _| dark(settings));
                    notifications
                        .connect_changed(Some(BANNERS), move |settings, _| quiet(settings));
                    glib::MainLoop::new(Some(&context), false).run();
                })
                .expect("a context of this thread's own");
        });
        Self {
            context: context.recv().expect("the settings thread"),
        }
    }

    pub fn set_dark(&self, dark: bool) {
        self.context.invoke(move || {
            let _ = gio::Settings::new(INTERFACE)
                .set_string(SCHEME, if dark { DARK } else { "default" });
        });
    }

    pub fn set_quiet(&self, quiet: bool) {
        self.context.invoke(move || {
            let _ = gio::Settings::new(NOTIFICATIONS).set_boolean(BANNERS, !quiet);
        });
    }
}
