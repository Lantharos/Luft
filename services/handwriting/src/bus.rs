use std::sync::Arc;

use anyhow::Context;
use luft_dbus_macros::introspect;
use luft_handwriting::types::{HandwritingDownload, HandwritingModel, Stroke};
use zbus::interface;
use zbus::object_server::SignalEmitter;

use crate::hub::{self, Hub, NotInstalled, Reader};
use crate::priority::Background;

luft_dbus::errors!("com.lantharos.Handwriting1.Error" {
    NotInstalled,
    Paused,
});

fn not_installed(_: NotInstalled) -> Error {
    Error::NotInstalled(hub::model().id.clone())
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
        if luft_dbus::power::saving_battery().await {
            return Err(Error::Paused("The battery is low.".into()));
        }
        let hub = self.hub.clone();
        self.background
            .run(move || hub.recognize(&strokes, Reader::Background))
            .await?
            .map_err(not_installed)
    }

    async fn recognize_now(&self, strokes: Vec<Stroke>) -> Result<String, Error> {
        let hub = self.hub.clone();
        tokio::task::spawn_blocking(move || hub.recognize(&strokes, Reader::Waiting))
            .await
            .context("Reading the handwriting stopped unexpectedly.")??
            .map_err(not_installed)
    }
}

#[introspect]
#[interface(name = "com.lantharos.Handwriting1.Models")]
impl Models {
    fn overview(&self) -> String {
        let model = hub::model();
        let overview = HandwritingModel {
            name: model.name.clone(),
            licence: model.licence.clone(),
            credit: model.credit.clone(),
            homepage: model.homepage.clone(),
            size: model.size(),
            installed: self.hub.models.store.installed(model),
            download: self
                .hub
                .models
                .downloads
                .progress(&model.id)
                .map(|progress| HandwritingDownload {
                    received: progress.received,
                    total: progress.total,
                    problem: progress.problem,
                }),
        };
        serde_json::to_string(&overview).expect("the overview always serializes")
    }

    fn install(&self) -> Result<(), Error> {
        self.hub.models.install(hub::model())?;
        Ok(())
    }

    fn remove(&self) -> Result<(), Error> {
        Ok(self.hub.models.remove(hub::model())?)
    }

    #[zbus(signal)]
    pub async fn changed(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}
