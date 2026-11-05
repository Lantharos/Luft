mod archive;
mod model;
mod peaks;
#[cfg(test)]
mod tests;

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;

pub use model::{Board, BoardId, Library, Look, Sound, Trigger};
pub use peaks::peaks;

use luft_i18n::t;

use crate::L10N;
use crate::audio::pcm::{self, Pcm};
use crate::audio::{SoundId, decode};

const LIBRARY_FILE: &str = "library.json";
const DEFAULT_COLOR: &str = "sand";
const FULL_LEVEL: f32 = 1.0;
const MAX_FRAMES: usize = u32::MAX as usize;

pub fn sound_gone() -> String {
    t!(L10N, "error-sound-gone")
}

fn board_gone() -> String {
    t!(L10N, "error-board-gone")
}

fn failed(error: impl ToString) -> String {
    error.to_string()
}

fn new_id() -> u32 {
    let mut bytes = [0; 4];
    getrandom::fill(&mut bytes).expect("the system gives random numbers");
    // Page code keeps these as numbers, and a sign would make a shortcut's id look different from the sound's.
    u32::from_ne_bytes(bytes) >> 1
}

/// The boards, and every sound copied and decoded into the app's data folder, so it plays long after the original moved.
pub struct Store {
    folder: PathBuf,
    pub library: Library,
    decoded: HashMap<SoundId, Arc<Pcm>>,
}

impl Store {
    pub fn open(folder: PathBuf) -> Result<Self, String> {
        fs::create_dir_all(folder.join("sounds")).map_err(failed)?;
        let library = fs::read(folder.join(LIBRARY_FILE))
            .ok()
            .and_then(|bytes| serde_json::from_slice(&bytes).ok())
            .unwrap_or_default();
        let mut store = Self {
            folder,
            library,
            decoded: HashMap::new(),
        };
        if store.library.boards.is_empty() {
            store.add_board(t!(L10N, "first-board"))?;
        }
        store.open_decoded();
        Ok(store)
    }

    fn open_decoded(&mut self) {
        for sound in &self
            .library
            .boards
            .iter()
            .flat_map(|board| &board.sounds)
            .cloned()
            .collect::<Vec<_>>()
        {
            if self.pcm_of(sound).is_none() {
                let _ = self.decode_again(sound);
            }
        }
    }

    fn pcm_of(&mut self, sound: &Sound) -> Option<Arc<Pcm>> {
        let pcm = Pcm::open(&self.pcm_path(sound.id)).ok().map(Arc::new)?;
        self.decoded.insert(sound.id, pcm.clone());
        Some(pcm)
    }

    fn decode_again(&mut self, sound: &Sound) -> Result<(), String> {
        let samples = decode::decode(&self.file_path(&sound.file))?;
        pcm::write(&self.pcm_path(sound.id), &samples).map_err(failed)?;
        self.pcm_of(sound)
            .map(drop)
            .ok_or_else(|| t!(L10N, "error-unreadable"))
    }

    fn pcm_path(&self, id: SoundId) -> PathBuf {
        self.folder.join("sounds").join(format!("{id}.pcm"))
    }

    pub fn file_path(&self, file: &str) -> PathBuf {
        self.folder.join("sounds").join(file)
    }

    pub fn save(&self) -> Result<(), String> {
        let bytes = serde_json::to_vec(&self.library).map_err(failed)?;
        luft_app::files::replace(&self.folder.join(LIBRARY_FILE), &bytes).map_err(failed)
    }

    pub fn pcm(&self, id: SoundId) -> Option<Arc<Pcm>> {
        self.decoded.get(&id).cloned()
    }

    pub fn add_board(&mut self, name: String) -> Result<BoardId, String> {
        let id = new_id();
        self.library.boards.push(Board {
            id,
            name,
            sounds: Vec::new(),
        });
        self.save()?;
        Ok(id)
    }

    pub fn rename_board(&mut self, id: BoardId, name: String) -> Result<(), String> {
        self.library.board_mut(id).ok_or_else(board_gone)?.name = name;
        self.save()
    }

    pub fn remove_board(&mut self, id: BoardId) -> Result<(), String> {
        let index = self
            .library
            .boards
            .iter()
            .position(|board| board.id == id)
            .ok_or_else(board_gone)?;
        let board = self.library.boards.remove(index);
        for sound in &board.sounds {
            self.forget_files(sound);
        }
        if self.library.boards.is_empty() {
            self.add_board(t!(L10N, "first-board"))?;
        }
        self.save()
    }

    /// Copies and decodes a file, then adds it to a board, all outside the app's lock when `Prepared` is made first.
    pub fn add_prepared(&mut self, board: BoardId, prepared: Prepared) -> Result<Sound, String> {
        let sound = prepared.sound.clone();
        self.decoded.insert(sound.id, prepared.pcm);
        self.library
            .board_mut(board)
            .ok_or_else(board_gone)?
            .sounds
            .push(prepared.sound);
        self.save()?;
        Ok(sound)
    }

    pub fn update(&mut self, sound: Sound) -> Result<(), String> {
        let current = self.library.sound_mut(sound.id).ok_or_else(sound_gone)?;
        let end = sound.trim_end.min(current.frames).max(1);
        *current = Sound {
            file: current.file.clone(),
            frames: current.frames,
            trim_start: sound.trim_start.min(end - 1),
            trim_end: end,
            level: sound.level.clamp(0.0, 2.0),
            ..sound
        };
        self.save()
    }

    pub fn remove(&mut self, id: SoundId) -> Result<(), String> {
        let sound = self.library.sound(id).cloned().ok_or_else(sound_gone)?;
        for board in &mut self.library.boards {
            board.sounds.retain(|sound| sound.id != id);
        }
        self.forget_files(&sound);
        self.save()
    }

    pub fn reorder(&mut self, board: BoardId, order: &[SoundId]) -> Result<(), String> {
        let board = self.library.board_mut(board).ok_or_else(board_gone)?;
        board.sounds.sort_by_key(|sound| {
            order
                .iter()
                .position(|id| *id == sound.id)
                .unwrap_or(usize::MAX)
        });
        self.save()
    }

    pub fn set_picture(&mut self, id: SoundId, picture: &Path) -> Result<(), String> {
        let extension = picture
            .extension()
            .and_then(|extension| extension.to_str())
            .unwrap_or("png");
        let file = format!("{}-picture.{extension}", new_id());
        fs::copy(picture, self.file_path(&file)).map_err(failed)?;
        let sound = self.library.sound_mut(id).ok_or_else(sound_gone)?;
        sound.look = Look::Picture(file);
        self.save()
    }

    fn forget_files(&mut self, sound: &Sound) {
        self.decoded.remove(&sound.id);
        let _ = fs::remove_file(self.pcm_path(sound.id));
        let _ = fs::remove_file(self.file_path(&sound.file));
        if let Look::Picture(picture) = &sound.look {
            let _ = fs::remove_file(self.file_path(picture));
        }
    }

    pub fn sounds_folder(&self) -> PathBuf {
        self.folder.join("sounds")
    }

    pub fn export(&self, id: BoardId, path: &Path) -> Result<(), String> {
        let board = self
            .library
            .boards
            .iter()
            .find(|board| board.id == id)
            .ok_or_else(board_gone)?;
        archive::write(board, &self.sounds_folder(), path)
    }

    /// Adds a board from a file made by [`Self::export`], with new ids so it never collides with what's here.
    pub fn import(&mut self, path: &Path) -> Result<BoardId, String> {
        let mut board = archive::read(path, &self.sounds_folder())?;
        board.id = new_id();
        for sound in &board.sounds {
            self.decode_again(sound)?;
        }
        let id = board.id;
        self.library.boards.push(board);
        self.save()?;
        Ok(id)
    }
}

/// A file copied into the data folder and decoded, ready to join a board.
pub struct Prepared {
    sound: Sound,
    pcm: Arc<Pcm>,
}

/// The slow part of adding a file, which takes no lock on the library.
pub fn prepare(folder: &Path, path: &Path) -> Result<Prepared, String> {
    let samples = decode::decode(path)?;
    let frames = samples.len() / crate::audio::CHANNELS;
    if frames > MAX_FRAMES {
        return Err(t!(L10N, "error-too-long"));
    }
    let id = new_id();
    let extension = path
        .extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or("audio");
    let file = format!("{id}.{extension}");
    fs::copy(path, folder.join(&file)).map_err(failed)?;
    let decoded = folder.join(format!("{id}.pcm"));
    pcm::write(&decoded, &samples).map_err(failed)?;
    let name = path
        .file_stem()
        .map(|stem| stem.to_string_lossy().into_owned())
        .unwrap_or_default();
    Ok(Prepared {
        sound: Sound {
            id,
            name,
            file,
            frames: frames as u32,
            look: Look::Plain,
            color: DEFAULT_COLOR.into(),
            level: FULL_LEVEL,
            trim_start: 0,
            trim_end: frames as u32,
            looping: false,
            stop_others: false,
            trigger: Trigger::Press,
        },
        pcm: Arc::new(Pcm::open(&decoded).map_err(failed)?),
    })
}
