mod infer;
mod pixels;
mod upscale;

use std::sync::{Arc, LazyLock};

use luft_app::Events;
use luft_i18n::t;
use luft_models::{Catalog, Library};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::bridge::events::MODELS_CHANGED;
use crate::files::failed;
use crate::l10n::L10N;

pub use infer::{Task, run};

#[derive(Deserialize, Clone, Copy, PartialEq, Eq, Debug, Type, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Engine {
    Matte,
    Inpaint,
    Upscale,
}

static CATALOG: LazyLock<Catalog<Engine>> =
    LazyLock::new(|| Catalog::parse(include_str!("../../../data/models.json")));

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Model {
    id: String,
    engine: Engine,
    name: String,
    licence: String,
    credit: String,
    size: f64,
    installed: bool,
    received: Option<f64>,
    problem: Option<String>,
}

#[derive(Clone)]
pub struct Models {
    library: Arc<Mutex<Option<Library<Engine>>>>,
    events: Events,
}

#[derive(Deserialize, Type)]
pub struct Install {
    pub engine: Engine,
}

impl Models {
    pub fn new(events: Events) -> Self {
        Self {
            library: Arc::default(),
            events,
        }
    }

    fn with<T>(
        &self,
        use_library: impl FnOnce(&Library<Engine>) -> Result<T, String>,
    ) -> Result<T, String> {
        let mut library = self.library.lock();
        if library.is_none() {
            let events = self.events.clone();
            let app_id = sabine::AppEnvironment::current().app_id(crate::APP_ID);
            *library = Some(
                Library::open(&app_id, &CATALOG, move || {
                    events.emit(MODELS_CHANGED, ());
                })
                .map_err(failed)?,
            );
        }
        use_library(library.as_ref().expect("the library is open"))
    }

    fn entry(engine: Engine) -> Result<&'static luft_models::Entry<Engine>, String> {
        CATALOG
            .models()
            .iter()
            .find(|entry| entry.engine == engine)
            .ok_or_else(|| t!(L10N, "easel-error-no-model"))
    }

    pub fn list(&self) -> Result<Vec<Model>, String> {
        self.with(|library| {
            Ok(CATALOG
                .models()
                .iter()
                .map(|entry| {
                    let progress = library.downloads.progress(&entry.id);
                    Model {
                        id: entry.id.clone(),
                        engine: entry.engine,
                        name: entry.name.clone(),
                        licence: entry.licence.clone(),
                        credit: entry.credit.clone(),
                        size: entry.size() as f64,
                        installed: library.store.installed(entry),
                        received: progress.as_ref().map(|progress| progress.received as f64),
                        problem: progress.and_then(|progress| progress.problem),
                    }
                })
                .collect())
        })
    }

    pub fn install(&self, engine: Engine) -> Result<(), String> {
        let entry = Self::entry(engine)?;
        self.with(|library| library.install(entry).map(drop).map_err(failed))
    }

    pub fn cancel(&self, engine: Engine) -> Result<(), String> {
        let entry = Self::entry(engine)?;
        self.with(|library| {
            library.cancel_install(&entry.id);
            Ok(())
        })
    }

    pub fn path(&self, engine: Engine) -> Result<std::path::PathBuf, String> {
        let entry = Self::entry(engine)?;
        self.with(|library| {
            if !library.store.installed(entry) {
                return Err(t!(L10N, "easel-error-model-missing"));
            }
            Ok(library.store.folder(entry).join(&entry.files[0].name))
        })
    }
}

pub struct Job {
    pub task: Task,
    pub width: u32,
    pub height: u32,
    pub pixels: Vec<u8>,
    pub mask: Vec<u8>,
}

#[derive(Deserialize, Type)]
pub struct Begin {
    pub task: Task,
    pub width: u32,
    pub height: u32,
}

#[derive(Deserialize, Type)]
pub struct Chunk {
    pub id: u32,
    pub mask: bool,
}

#[derive(Serialize, Type)]
pub struct Output {
    file: String,
    width: u32,
    height: u32,
    channels: u8,
}

impl Job {
    pub fn new(
        Begin {
            task,
            width,
            height,
        }: Begin,
    ) -> Self {
        Self {
            task,
            width,
            height,
            pixels: Vec::new(),
            mask: Vec::new(),
        }
    }

    pub fn finish(self, models: &Models, events: &Events) -> Result<Output, String> {
        let progress = |share: f64| {
            events.emit(crate::bridge::events::AI_PROGRESS, share);
        };
        let result = run(
            models,
            self.task,
            &self.pixels,
            &self.mask,
            (self.width, self.height),
            &progress,
        )?;
        let factor = match self.task {
            Task::Upscale2 => 2,
            Task::Upscale4 => 4,
            _ => 1,
        };
        let file = crate::files::cache_file("ai")?;
        std::fs::write(&file, &result).map_err(failed)?;
        Ok(Output {
            file: file.to_string_lossy().into_owned(),
            width: self.width * factor,
            height: self.height * factor,
            channels: if matches!(self.task, Task::Matte) {
                1
            } else {
                4
            },
        })
    }
}
