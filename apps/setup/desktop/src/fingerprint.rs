use std::sync::OnceLock;

use futures_util::StreamExt;
use luft_app::{Commands, Empty, Events, dbus};
use luft_fingerprint::{EnrollProgress, PROGRESS};
use sabine::SabineWindow;
use serde::Deserialize;
use zbus::message::Type;
use zbus::{MatchRule, MessageStream};

use crate::installer::{self, INSTALLER};

const STATUS: &str = "FingerprintStatus";

static LISTENING: OnceLock<()> = OnceLock::new();

#[derive(Deserialize, specta::Type)]
struct Finger {
    finger: String,
}

async fn listen(events: Events) {
    let Ok(system) = dbus::system().await else {
        return;
    };
    let Ok(rule) = MatchRule::builder()
        .msg_type(Type::Signal)
        .sender(INSTALLER.name)
        .interface(INSTALLER.interface)
        .member(STATUS)
        .build()
    else {
        return;
    };
    let Ok(mut messages) = MessageStream::for_match_rule(rule, system, None).await else {
        return;
    };
    while let Some(message) = messages.next().await {
        if let Ok((result, done)) =
            message.and_then(|message| message.body().deserialize::<(String, bool)>())
        {
            events.emit(PROGRESS, EnrollProgress { result, done });
        }
    }
}

async fn enroll(events: Events, Finger { finger }: Finger) -> Result<(), String> {
    LISTENING.get_or_init(|| {
        luft_app::spawn(listen(events));
    });
    installer::call("EnrollFingerprint", &(finger,)).await
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    luft_fingerprint::register_reader(window)
        .bridge_event(&PROGRESS)
        .with_async("fingerprint_enroll", events, enroll)
        .command_async("fingerprint_stop", |Empty {}| async {
            installer::call::<_, ()>("StopFingerprint", &()).await
        })
}
