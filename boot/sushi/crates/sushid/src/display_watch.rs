//! Watch for new DRM devices and trigger display handoff.

use std::fs;
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, Receiver};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

pub fn spawn_display_watch(running: Arc<AtomicBool>) -> DisplayWatch {
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        let mut known = list_drm_cards();
        while running.load(Ordering::SeqCst) {
            let current = list_drm_cards();
            for card in &current {
                if !known.contains(card) {
                    let _ = tx.send(card.clone());
                }
            }
            known = current;
            thread::sleep(Duration::from_millis(500));
        }
    });
    DisplayWatch { rx }
}

pub struct DisplayWatch {
    rx: Receiver<String>,
}

impl DisplayWatch {
    pub fn try_recv_handoff(&self) -> Option<String> {
        self.rx.try_recv().ok()
    }
}

fn list_drm_cards() -> Vec<String> {
    let mut cards = Vec::new();
    let Ok(entries) = fs::read_dir("/dev/dri") else {
        return cards;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        let Some(name) = path.file_name().and_then(|n| n.to_str()) else {
            continue;
        };
        if name.starts_with("card") && !name.contains('-') && Path::new(&path).exists() {
            cards.push(path.display().to_string());
        }
    }
    cards.sort();
    cards
}