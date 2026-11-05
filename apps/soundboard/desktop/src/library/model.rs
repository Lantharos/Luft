use serde::{Deserialize, Serialize};
use specta::Type;

use crate::audio::SoundId;

pub type BoardId = u32;

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase", tag = "kind", content = "value")]
pub enum Look {
    #[default]
    Plain,
    Emoji(String),
    Icon(String),
    Picture(String),
}

#[derive(Clone, Copy, Debug, Default, Deserialize, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Trigger {
    #[default]
    Press,
    Hold,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Sound {
    pub id: SoundId,
    pub name: String,
    pub file: String,
    pub frames: u32,
    pub look: Look,
    pub color: String,
    pub level: f32,
    pub trim_start: u32,
    pub trim_end: u32,
    pub looping: bool,
    pub stop_others: bool,
    pub trigger: Trigger,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Board {
    pub id: BoardId,
    pub name: String,
    pub sounds: Vec<Sound>,
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize, Type)]
pub struct Library {
    pub boards: Vec<Board>,
}

impl Library {
    pub fn sound(&self, id: SoundId) -> Option<&Sound> {
        self.sounds().find(|sound| sound.id == id)
    }

    pub fn sounds(&self) -> impl Iterator<Item = &Sound> {
        self.boards.iter().flat_map(|board| &board.sounds)
    }

    pub fn board_mut(&mut self, id: BoardId) -> Option<&mut Board> {
        self.boards.iter_mut().find(|board| board.id == id)
    }

    pub fn sound_mut(&mut self, id: SoundId) -> Option<&mut Sound> {
        self.boards
            .iter_mut()
            .flat_map(|board| &mut board.sounds)
            .find(|sound| sound.id == id)
    }
}
