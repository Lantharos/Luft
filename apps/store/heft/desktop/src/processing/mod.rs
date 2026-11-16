mod notes;
mod transcription;

use luft_app::Events;
use sabine::SabineWindow;

pub fn watch(events: &Events) {
    luft_app::spawn(transcription::watch(events.clone()));
    luft_app::spawn(notes::watch(events.clone()));
}

pub fn register(window: SabineWindow) -> SabineWindow {
    notes::register(transcription::register(window))
}
