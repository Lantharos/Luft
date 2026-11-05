use std::fs::File;
use std::io::Write;
use std::path::{Path, PathBuf};

use zip::ZipWriter;
use zip::write::SimpleFileOptions;

use super::{Look, Store, Trigger, peaks, prepare};
use crate::audio::{CHANNELS, RATE};

const FRAMES: u32 = RATE / 2;

fn wave(path: &Path, rate: u32) {
    let frames = rate / 2;
    let data = frames * 2;
    let mut bytes = Vec::new();
    bytes.extend_from_slice(b"RIFF");
    bytes.extend_from_slice(&(36 + data).to_le_bytes());
    bytes.extend_from_slice(b"WAVEfmt ");
    bytes.extend_from_slice(&16u32.to_le_bytes());
    bytes.extend_from_slice(&1u16.to_le_bytes());
    bytes.extend_from_slice(&1u16.to_le_bytes());
    bytes.extend_from_slice(&rate.to_le_bytes());
    bytes.extend_from_slice(&(rate * 2).to_le_bytes());
    bytes.extend_from_slice(&2u16.to_le_bytes());
    bytes.extend_from_slice(&16u16.to_le_bytes());
    bytes.extend_from_slice(b"data");
    bytes.extend_from_slice(&data.to_le_bytes());
    for frame in 0..frames {
        let sample = if frame % 20 < 10 { 12_000i16 } else { -12_000 };
        bytes.extend_from_slice(&sample.to_le_bytes());
    }
    std::fs::write(path, bytes).unwrap();
}

struct Fixture {
    folder: tempfile::TempDir,
    store: Store,
    board: u32,
}

fn fixture() -> Fixture {
    let folder = tempfile::tempdir().unwrap();
    let store = Store::open(folder.path().join("data")).unwrap();
    let board = store.library.boards[0].id;
    Fixture {
        folder,
        store,
        board,
    }
}

impl Fixture {
    fn add(&mut self, name: &str, rate: u32) -> u32 {
        let path = self.folder.path().join(name);
        wave(&path, rate);
        let prepared = prepare(&self.store.sounds_folder(), &path).unwrap();
        self.store.add_prepared(self.board, prepared).unwrap().id
    }

    fn path(&self, name: &str) -> PathBuf {
        self.folder.path().join(name)
    }
}

#[test]
fn a_new_library_starts_with_one_board() {
    assert_eq!(fixture().store.library.boards.len(), 1);
}

#[test]
fn any_sample_rate_arrives_as_48_khz_stereo_named_after_its_file() {
    let mut fixture = fixture();
    let id = fixture.add("airhorn.wav", 22_050);
    let sound = fixture.store.library.sound(id).unwrap();
    assert_eq!(sound.name, "airhorn");
    assert!(
        sound.frames.abs_diff(FRAMES) < 256,
        "{} frames",
        sound.frames
    );
    assert_eq!(sound.trim_end, sound.frames);
    let pcm = fixture.store.pcm(id).unwrap();
    assert_eq!(pcm.samples().len(), sound.frames as usize * CHANNELS);
}

#[test]
fn a_file_that_isnt_sound_is_refused_and_leaves_nothing_behind() {
    let fixture = fixture();
    let path = fixture.path("notes.wav");
    std::fs::write(&path, "these are not sounds").unwrap();
    assert!(prepare(&fixture.store.sounds_folder(), &path).is_err());
    assert_eq!(
        std::fs::read_dir(fixture.store.sounds_folder())
            .unwrap()
            .count(),
        0
    );
}

#[test]
fn sounds_keep_working_after_the_original_is_gone_and_the_app_restarts() {
    let mut fixture = fixture();
    let id = fixture.add("gone.wav", RATE);
    std::fs::remove_file(fixture.path("gone.wav")).unwrap();
    let store = Store::open(fixture.path("data")).unwrap();
    assert!(
        store
            .pcm(id)
            .unwrap()
            .samples()
            .iter()
            .any(|sample| sample.abs() > 0.1)
    );
}

#[test]
fn a_lost_decoded_copy_is_made_again_from_the_original() {
    let mut fixture = fixture();
    let id = fixture.add("kept.wav", RATE);
    std::fs::remove_file(fixture.store.sounds_folder().join(format!("{id}.pcm"))).unwrap();
    let store = Store::open(fixture.path("data")).unwrap();
    assert!(store.pcm(id).is_some());
}

#[test]
fn trims_stay_inside_the_sound_and_never_empty() {
    let mut fixture = fixture();
    let id = fixture.add("trim.wav", RATE);
    let mut sound = fixture.store.library.sound(id).unwrap().clone();
    let frames = sound.frames;
    sound.trim_start = frames + 50;
    sound.trim_end = frames + 100;
    fixture.store.update(sound).unwrap();
    let saved = fixture.store.library.sound(id).unwrap();
    assert_eq!((saved.trim_start, saved.trim_end), (frames - 1, frames));
}

#[test]
fn removing_a_sound_removes_its_files() {
    let mut fixture = fixture();
    let id = fixture.add("removed.wav", RATE);
    fixture.store.remove(id).unwrap();
    assert_eq!(
        std::fs::read_dir(fixture.store.sounds_folder())
            .unwrap()
            .count(),
        0
    );
    assert!(fixture.store.library.sound(id).is_none());
}

#[test]
fn a_board_survives_export_and_import_with_its_settings_and_new_ids() {
    let mut fixture = fixture();
    let id = fixture.add("exported.wav", RATE);
    let mut sound = fixture.store.library.sound(id).unwrap().clone();
    sound.name = "Renamed".into();
    sound.look = Look::Emoji("🎺".into());
    sound.color = "plum".into();
    sound.level = 0.5;
    sound.trim_start = 100;
    sound.looping = true;
    sound.trigger = Trigger::Hold;
    fixture.store.update(sound.clone()).unwrap();
    let file = fixture.path("party.soundboard");
    fixture.store.export(fixture.board, &file).unwrap();

    let mut other = self::fixture();
    let board = other.store.import(&file).unwrap();
    let imported = &other
        .store
        .library
        .boards
        .iter()
        .find(|candidate| candidate.id == board)
        .unwrap()
        .sounds[0];
    assert_ne!(imported.id, sound.id);
    assert_eq!(imported.name, sound.name);
    assert_eq!(imported.look, sound.look);
    assert_eq!(
        (imported.color.as_str(), imported.level, imported.trim_start),
        ("plum", 0.5, 100)
    );
    assert!(imported.looping && imported.trigger == Trigger::Hold);
    assert_eq!(
        other.store.pcm(imported.id).unwrap().samples(),
        fixture.store.pcm(sound.id).unwrap().samples()
    );
}

#[test]
fn a_board_file_cant_write_outside_the_data_folder() {
    let mut fixture = fixture();
    let id = fixture.add("evil.wav", RATE);
    let mut board = fixture.store.library.boards[0].clone();
    board.sounds[0].file = "../../escaped.wav".into();
    let file = fixture.path("evil.soundboard");
    let mut archive = ZipWriter::new(File::create(&file).unwrap());
    archive
        .start_file("board.json", SimpleFileOptions::default())
        .unwrap();
    archive
        .write_all(&serde_json::to_vec(&board).unwrap())
        .unwrap();
    archive
        .start_file("sounds/../../escaped.wav", SimpleFileOptions::default())
        .unwrap();
    archive.write_all(b"nope").unwrap();
    archive.finish().unwrap();
    assert!(fixture.store.import(&file).is_err());
    assert!(!fixture.path("escaped.wav").exists());
    assert!(fixture.store.library.sound(id).is_some());
}

#[test]
fn a_waveform_shows_where_the_sound_is_loud() {
    let mut fixture = fixture();
    let id = fixture.add("wave.wav", RATE);
    let shape = peaks(&fixture.store.pcm(id).unwrap(), 32);
    assert_eq!(shape.len(), 32);
    assert!(shape.iter().all(|peak| *peak > 0.2));
}
