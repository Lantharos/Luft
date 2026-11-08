use std::sync::Arc;

use luft_dbus_macros::introspect;
use luft_handwriting::types::{HandwritingDownload, HandwritingModel, Stroke};
use zbus::interface;
use zbus::object_server::SignalEmitter;

use crate::hub::{self, Hub, NotInstalled, Urgency};
use crate::priority::Background;

#[derive(Debug, zbus::DBusError)]
#[zbus(prefix = "com.lantharos.Handwriting1.Error")]
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

pub struct Recognition {
    hub: Arc<Hub>,
    background: Background,
}

pub struct Models {
    hub: Arc<Hub>,
}

pub fn serve(hub: &Arc<Hub>) -> (Recognition, Models) {
    (
        Recognition {
            hub: hub.clone(),
            background: Background::start(),
        },
        Models { hub: hub.clone() },
    )
}

#[introspect]
#[interface(name = "com.lantharos.Handwriting1")]
impl Recognition {
    async fn recognize(&self, strokes: Vec<Stroke>) -> Result<String, Error> {
        if let Ok(system) = luft_dbus::system().await
            && luft_dbus::power::battery_low(system).await
        {
            return Err(Error::Paused("The battery is low".into()));
        }
        let hub = self.hub.clone();
        let read = self
            .background
            .run(move || hub.recognize(&strokes, Urgency::Background))
            .await?;
        read.map_err(|NotInstalled| Error::NotInstalled(hub::model().id.clone()))
    }

    async fn recognize_now(&self, strokes: Vec<Stroke>) -> Result<String, Error> {
        let hub = self.hub.clone();
        let read = tokio::task::spawn_blocking(move || hub.recognize(&strokes, Urgency::Waiting))
            .await
            .map_err(|error| Error::Failed(error.to_string()))??;
        read.map_err(|NotInstalled| Error::NotInstalled(hub::model().id.clone()))
    }
}

#[introspect]
#[interface(name = "com.lantharos.Handwriting1.Models")]
impl Models {
    fn overview(&self) -> String {
        let model = hub::model();
        let overview =
            HandwritingModel {
                name: model.name.clone(),
                licence: model.licence.clone(),
                credit: model.credit.clone(),
                homepage: model.homepage.clone(),
                size: model.size(),
                installed: self.hub.store.installed(model),
                download: self.hub.downloads.progress(&model.id).map(|progress| {
                    HandwritingDownload {
                        received: progress.received,
                        total: progress.total,
                        problem: progress.problem,
                    }
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
