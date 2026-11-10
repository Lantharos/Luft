use std::sync::Arc;

use anyhow::Context;
use luft_dbus_macros::introspect;
use luft_language::types::{HeadingRequest, LanguageDownload, LanguageModel, NotesRequest};
use serde::Serialize;
use zbus::interface;
use zbus::object_server::SignalEmitter;

use crate::hub::{self, Hub, NotInstalled};
use crate::notes;

luft_dbus::errors!("com.lantharos.Language1.Error" {
    NotInstalled,
    Paused,
    Unreadable,
});

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
        if luft_dbus::power::saving_battery().await {
            return Err(Error::Paused("The battery is low.".into()));
        }
        let request: R = serde_json::from_str(request)
            .map_err(|_| Error::Unreadable("That request couldn't be read.".into()))?;
        let hub = self.hub.clone();
        let written =
            tokio::task::spawn_blocking(move || hub.with_writer(|writer| write(writer, &request)))
                .await
                .context("Writing stopped unexpectedly.")??
                .map_err(|NotInstalled| Error::NotInstalled(hub::model().id.clone()))?;
        Ok(serde_json::to_string(&written).expect("what's written always serializes"))
    }
}

#[introspect]
#[interface(name = "com.lantharos.Language1")]
impl Writing {
    async fn notes(&self, request: String) -> Result<String, Error> {
        self.write::<NotesRequest, _>(&request, notes::notes).await
    }

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
            installed: self.hub.models.store.installed(model),
            download: self
                .hub
                .models
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
        self.hub.models.install(hub::model())?;
        Ok(())
    }

    fn remove(&self) -> Result<(), Error> {
        Ok(self.hub.models.remove(hub::model())?)
    }

    #[zbus(signal)]
    pub async fn changed(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}
