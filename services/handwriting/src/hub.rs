use std::sync::{Condvar, LazyLock, Mutex};
use std::time::Duration;

use anyhow::Result;
use luft_handwriting::types::Stroke;
use luft_models::{Catalog, Entry, Library, Warm};
use serde::Deserialize;

use crate::ink;
use crate::recognizer::Recognizer;

pub const NAME: &str = "com.lantharos.Handwriting1";
pub const PATH: &str = "/com/lantharos/Handwriting1";
const WARM_FOR: Duration = Duration::from_secs(180);

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Engine {
    Vision,
}

pub static CATALOG: LazyLock<Catalog<Engine>> =
    LazyLock::new(|| Catalog::parse(include_str!("../data/models.json")));

pub fn model() -> &'static Entry<Engine> {
    &CATALOG.models()[0]
}

pub struct NotInstalled;

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Reader {
    Waiting,
    Background,
}

pub struct Hub {
    pub models: Library<Engine>,
    recognizer: Warm<Recognizer>,
    readers_waiting: Mutex<usize>,
    nobody_waiting: Condvar,
}

struct AheadOfBackground<'a>(&'a Hub);

impl<'a> AheadOfBackground<'a> {
    fn new(hub: &'a Hub) -> Self {
        *hub.readers_waiting.lock().expect("waiting lock") += 1;
        Self(hub)
    }
}

impl Drop for AheadOfBackground<'_> {
    fn drop(&mut self) {
        let mut waiting = self.0.readers_waiting.lock().expect("waiting lock");
        *waiting -= 1;
        if *waiting == 0 {
            self.0.nobody_waiting.notify_all();
        }
    }
}

impl Hub {
    pub fn new(models: Library<Engine>) -> Self {
        Self {
            models,
            recognizer: Warm::default(),
            readers_waiting: Mutex::new(0),
            nobody_waiting: Condvar::new(),
        }
    }

    pub fn recognize(
        &self,
        strokes: &[Stroke],
        reader: Reader,
    ) -> Result<Result<String, NotInstalled>> {
        let Some(line) = ink::draw(strokes) else {
            return Ok(Ok(String::new()));
        };
        if !self.models.store.installed(model()) {
            return Ok(Err(NotInstalled));
        }
        let _ahead = match reader {
            Reader::Waiting => Some(AheadOfBackground::new(self)),
            Reader::Background => {
                drop(
                    self.nobody_waiting
                        .wait_while(
                            self.readers_waiting.lock().expect("waiting lock"),
                            |waiting| *waiting > 0,
                        )
                        .expect("waiting lock"),
                );
                None
            }
        };
        self.recognizer
            .with(
                || Recognizer::load(&self.models.store.folder(model())),
                |recognizer| recognizer.read(&line),
            )
            .map(Ok)
    }

    pub fn busy(&self) -> bool {
        self.recognizer.expire(WARM_FOR);
        self.models.downloads.active() || self.recognizer.loaded()
    }
}
