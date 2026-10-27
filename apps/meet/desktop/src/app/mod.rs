pub mod calls;
pub mod job;
mod stick;

use std::sync::{Arc, OnceLock};

use sabine::{BridgeError, BridgeEvent, BridgeEventEmitter, SabineWindow, SingleInstancePolicy};
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::language;
#[cfg(target_os = "linux")]
use crate::linux::app as platform;
use crate::live::download::Channel;
use crate::live::source::Source;
use crate::protocol::answers::{Installed, Prepared, Range, Report};
use crate::protocol::{Call, Progress, Restarting};
use crate::stick::Sticks;
use crate::stick::copy::Room;
#[cfg(windows)]
use crate::windows::app as platform;
use job::Jobs;

const APP_ID: &str = "com.lantharos.meet";
pub const TITLE: &str = "Meet Luft";
const SIZE: (u32, u32) = (900, 620);
const NIGHTLY: &str = "--nightly";
pub const PROGRESS: BridgeEvent<Progress> = BridgeEvent::new("meet.progress");

#[derive(Clone, Default)]
pub struct Events(Arc<OnceLock<BridgeEventEmitter>>);

impl Events {
    pub fn emit<T: Serialize>(&self, event: BridgeEvent<T>, payload: T) {
        if let Some(emitter) = self.0.get() {
            emitter.send(&event, &payload);
        }
    }
}

#[derive(Deserialize, Type)]
pub struct Empty {}

#[derive(Deserialize, Type)]
struct FileAt {
    path: String,
}

fn source() -> Source {
    let channel = if std::env::args().any(|argument| argument == NIGHTLY) {
        Channel::Nightly
    } else {
        Channel::Latest
    };
    Source::Download { channel }
}

fn window(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = window
        .title(TITLE)
        .fixed_size(SIZE.0, SIZE.1)
        .frameless()
        .single_instance_id(APP_ID)
        .single_instance(SingleInstancePolicy::FocusExisting)
        .bridge_event(&PROGRESS)
        .bridge_typed("meet_source", |Empty {}| Ok::<_, BridgeError>(source()))
        .bridge_typed("meet_platform", |Empty {}| {
            Ok::<_, BridgeError>(platform::PLATFORM)
        })
        .bridge_typed("meet_locale", |Empty {}| {
            Ok::<_, BridgeError>(language::locale())
        });
    Jobs::new(window, events)
        .helped::<_, Report>("meet_check", Call::Check)
        .helped::<_, Prepared>("meet_prepare", Call::Prepare)
        .helped::<_, Prepared>("meet_refresh", Call::Refresh)
        .helped::<_, Prepared>("meet_pack", Call::Pack)
        .helped::<_, ()>("meet_restart", |restarting: Restarting| {
            Call::Restart(Restarting {
                hints: platform::hints(),
                ..restarting
            })
        })
        .helped::<_, ()>("meet_tidy", |Empty {}| Call::Tidy)
        .helped::<_, ()>("meet_firmware_settings", |Empty {}| Call::FirmwareSettings)
        .helped::<_, ()>("meet_undo", |Empty {}| Call::Undo)
        .helped::<_, Option<Installed>>("meet_luft", |Empty {}| Call::Luft)
        .helped::<_, Option<Range>>("meet_luft_range", |Empty {}| Call::LuftRange)
        .helped::<_, Installed>("meet_resize_luft", Call::ResizeLuft)
        .helped::<_, Installed>("meet_cancel_resize", |Empty {}| Call::CancelResize)
        .helped::<_, Installed>("meet_give_windows", |Empty {}| Call::GiveWindows)
        .helped::<_, ()>("meet_start_luft", |Empty {}| Call::StartLuft)
        .helped::<_, ()>("meet_remove_luft", |Empty {}| Call::RemoveLuft)
        .helped::<_, Sticks>("meet_sticks", Call::Sticks)
        .helped::<_, Room>("meet_ventoy_room", Call::VentoyRoom)
        .job("meet_installed", |_, Empty {}| {
            Ok(platform::luft_installed())
        })
        .job("meet_belongings", |_, Empty {}| platform::belongings())
        .job("meet_save_logs", |_, Empty {}| platform::save_logs())
        .job("meet_show_file", |_, FileAt { path }| {
            platform::show_file(&path)
        })
        .job("meet_stick_offer", |_, sourced| stick::offer(sourced))
        .job("meet_make_stick", stick::make)
        .job("meet_pick_iso", |_, Empty {}| Ok(platform::pick_iso()))
        .window()
}

pub fn run() {
    language::choose();
    let events = Events::default();
    let attached = events.clone();
    SabineWindow::main_with_process(
        move |built| Ok(window(built, &events)),
        move |process| {
            if let Some(emitter) = process.bridge_event_emitter() {
                let _ = attached.0.set(emitter);
            }
        },
    );
}
