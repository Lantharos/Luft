mod service;

use std::collections::HashSet;

use luft_app::shortcuts::Event;

pub use service::{Hotkey, Hotkeys, changed};

use crate::audio::SoundId;
use crate::library::Trigger;

pub const STOP_ALL: &str = "stop-all";
const SOUND_PREFIX: &str = "sound-";

pub fn shortcut_id(sound: SoundId) -> String {
    format!("{SOUND_PREFIX}{sound}")
}

pub fn sound_of(id: &str) -> Option<SoundId> {
    id.strip_prefix(SOUND_PREFIX)?.parse().ok()
}

#[derive(Debug, PartialEq)]
pub enum Action {
    Play(SoundId),
    Stop(SoundId),
    StopAll,
    Rebound(Vec<luft_app::shortcuts::Bound>),
}

/// Turns what the desktop reports about shortcuts into what the audio should do. A held key can report its press more
/// than once, so hold-to-play sounds remember being held.
#[derive(Default)]
pub struct Router {
    held: HashSet<SoundId>,
}

impl Router {
    pub fn route(
        &mut self,
        event: Event,
        trigger_of: impl Fn(SoundId) -> Option<Trigger>,
    ) -> Option<Action> {
        match event {
            Event::Pressed(id) if id == STOP_ALL => Some(Action::StopAll),
            Event::Pressed(id) => {
                let sound = sound_of(&id)?;
                match trigger_of(sound)? {
                    Trigger::Press => Some(Action::Play(sound)),
                    Trigger::Hold => self.held.insert(sound).then_some(Action::Play(sound)),
                }
            }
            Event::Released(id) => {
                let sound = sound_of(&id)?;
                self.held.remove(&sound).then_some(Action::Stop(sound))
            }
            Event::Changed(bound) => Some(Action::Rebound(bound)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn triggers(sound: SoundId) -> Option<Trigger> {
        match sound {
            1 => Some(Trigger::Press),
            2 => Some(Trigger::Hold),
            _ => None,
        }
    }

    fn pressed(sound: SoundId) -> Event {
        Event::Pressed(shortcut_id(sound))
    }

    fn released(sound: SoundId) -> Event {
        Event::Released(shortcut_id(sound))
    }

    #[test]
    fn a_press_sound_plays_on_every_press_and_ignores_release() {
        let mut router = Router::default();
        assert_eq!(router.route(pressed(1), triggers), Some(Action::Play(1)));
        assert_eq!(router.route(released(1), triggers), None);
        assert_eq!(router.route(pressed(1), triggers), Some(Action::Play(1)));
    }

    #[test]
    fn a_hold_sound_plays_once_while_held_and_stops_on_release() {
        let mut router = Router::default();
        assert_eq!(router.route(pressed(2), triggers), Some(Action::Play(2)));
        assert_eq!(router.route(pressed(2), triggers), None);
        assert_eq!(router.route(released(2), triggers), Some(Action::Stop(2)));
        assert_eq!(router.route(pressed(2), triggers), Some(Action::Play(2)));
    }

    #[test]
    fn a_deleted_sound_and_a_foreign_shortcut_do_nothing() {
        let mut router = Router::default();
        assert_eq!(router.route(pressed(9), triggers), None);
        assert_eq!(router.route(Event::Pressed("mute".into()), triggers), None);
    }

    #[test]
    fn the_stop_shortcut_stops_everything() {
        let mut router = Router::default();
        assert_eq!(
            router.route(Event::Pressed(STOP_ALL.into()), triggers),
            Some(Action::StopAll)
        );
    }
}
