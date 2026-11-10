use std::sync::LazyLock;
use std::time::Duration;

use anyhow::Result;
use luft_models::{Catalog, Entry, Library, Warm};
use serde::Deserialize;

use crate::model::Writer;

pub const NAME: &str = "com.lantharos.Language1";
pub const PATH: &str = "/com/lantharos/Language1";
const WARM_FOR: Duration = Duration::from_secs(180);

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Engine {
    Text,
}

pub static CATALOG: LazyLock<Catalog<Engine>> =
    LazyLock::new(|| Catalog::parse(include_str!("../data/models.json")));

pub fn model() -> &'static Entry<Engine> {
    &CATALOG.models()[0]
}

pub struct NotInstalled;

pub struct Hub {
    pub models: Library<Engine>,
    writer: Warm<Writer>,
}

impl Hub {
    pub fn new(models: Library<Engine>) -> Self {
        Self {
            models,
            writer: Warm::default(),
        }
    }

    pub fn with_writer<T>(
        &self,
        write: impl FnOnce(&Writer) -> Result<T>,
    ) -> Result<Result<T, NotInstalled>> {
        if !self.models.store.installed(model()) {
            return Ok(Err(NotInstalled));
        }
        self.writer
            .with(
                || Writer::load(&self.models.store.folder(model())),
                |writer| write(writer),
            )
            .map(Ok)
    }

    pub fn busy(&self) -> bool {
        self.writer.expire(WARM_FOR);
        self.models.downloads.active() || self.writer.loaded()
    }
}
