use std::sync::Arc;

use luft_dbus_macros::introspect;
use luft_language::types::{HeadingRequest, LanguageDownload, LanguageModel, NotesRequest};
use serde::Serialize;
use zbus::interface;
use zbus::object_server::SignalEmitter;

use crate::hub::{self, Hub, NotInstalled};
use crate::notes;

#[derive(Debug, zbus::DBusError)]
#[zbus(prefix = "com.lantharos.Language1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotInstalled(String),
    Paused(String),
    Failed(String),
}

impl From<anyhow::Error> for Error {
    fn from(error: anyhow::Error) -> Self {
        Error::Failed(format!("{error:#}"))
    }
}

pub struct Writing {
    hub: Arc<Hub>,
}

pub struct Models {
    hub: Arc<Hub>,
}

pub fn serve(hub: &Arc<Hub>) -> (Writing, Models) {
    (Writing { hub: hub.clone() }, Models { hub: hub.clone() })
}

impl Writing {
    async fn write<R, T>(
        &self,
        request: &str,
        write: fn(&crate::model::Writer, &R) -> anyhow::Result<T>,
    ) -> Result<String, Error>
    where
        R: serde::de::DeserializeOwned + Send + 'static,
        T: Serialize + Send + 'static,
    {
        if let Ok(system) = luft_dbus::system().await
            && luft_dbus::power::battery_low(system).await
        {
            return Err(Error::Paused("The battery is low".into()));
        }
        let request: R = serde_json::from_str(request)
            .map_err(|error| Error::Failed(format!("The request doesn't read: {error}")))?;
        let hub = self.hub.clone();
        let written =
            tokio::task::spawn_blocking(move || hub.with_writer(|writer| write(writer, &request)))
                .await
                .map_err(|error| Error::Failed(error.to_string()))??
                .map_err(|NotInstalled| Error::NotInstalled(hub::model().id.clone()))?;
        Ok(serde_json::to_string(&written).expect("what's written always serializes"))
    }
}

#[introspect]
#[interface(name = "com.lantharos.Language1")]
impl Writing {
    /// Notes of part of a class: JSON NotesRequest in, JSON Notes out.
    async fn notes(&self, request: String) -> Result<String, Error> {
        self.write::<NotesRequest, _>(&request, notes::notes).await
    }

    /// A title and summary of a class from its key points: JSON HeadingRequest in, JSON Heading out.
    async fn heading(&self, request: String) -> Result<String, Error> {
        self.write::<HeadingRequest, _>(&request, notes::heading)
            .await
    }
}

#[introspect]
#[interface(name = "com.lantharos.Language1.Models")]
impl Models {
    fn overview(&self) -> String {
        let model = hub::model();
        let overview = LanguageModel {
            name: model.name.clone(),
            licence: model.licence.clone(),
            credit: model.credit.clone(),
            homepage: model.homepage.clone(),
            size: model.size(),
            installed: self.hub.store.installed(model),
            download: self
                .hub
                .downloads
                .progress(&model.id)
                .map(|progress| LanguageDownload {
                    received: progress.received,
                    total: progress.total,
                    problem: progress.problem,
                }),
        };
        serde_json::to_string(&overview).expect("the overview always serializes")
    }

    fn install(&self) -> Result<(), Error> {
        self.hub.install()?;
        self.hub.changed();
        Ok(())
    }

    fn remove(&self) -> Result<(), Error> {
        let model = hub::model();
        self.hub.downloads.cancel(&model.id);
        self.hub.store.remove(model)?;
        self.hub.changed();
        Ok(())
    }

    #[zbus(signal)]
    pub async fn changed(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}
