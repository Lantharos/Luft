use std::sync::Arc;

use luft_speech::types::{Download, Language, Model, Overview};
use zbus::interface;

use crate::dictation::Session;
use crate::hub::Hub;
use crate::language;
use crate::models::manifest;
use crate::plan::Plan;
use crate::preferences;

#[derive(Debug, zbus::DBusError)]
#[zbus(prefix = "com.lantharos.Speech1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotInstalled(String),
    Failed(String),
}

impl From<anyhow::Error> for Error {
    fn from(error: anyhow::Error) -> Self {
        Error::Failed(format!("{error:#}"))
    }
}

pub struct Dictation {
    hub: Arc<Hub>,
}

pub struct Models {
    hub: Arc<Hub>,
}

pub fn serve(hub: &Arc<Hub>) -> (Dictation, Models) {
    (Dictation { hub: hub.clone() }, Models { hub: hub.clone() })
}

#[interface(name = "com.lantharos.Speech1")]
impl Dictation {
    async fn start(&self, layout: String) -> Result<(), Error> {
        let plan = Plan::now(Some(layout.as_str()).filter(|layout| !layout.is_empty()));
        if !self.hub.store.installed(plan.model) {
            return Err(Error::NotInstalled(plan.model.id.clone()));
        }
        let mut session = self.hub.session.lock().await;
        if let Some(previous) = session.take() {
            previous.cancel();
        }
        *session = Some(Session::start(&self.hub, plan)?);
        Ok(())
    }

    async fn stop(&self) -> Result<String, Error> {
        let session = self.hub.session.lock().await.take();
        match session {
            Some(session) => Ok(session.finish().await?),
            None => Ok(String::new()),
        }
    }

    async fn cancel(&self) {
        if let Some(session) = self.hub.session.lock().await.take() {
            session.cancel();
        }
    }
}

#[interface(name = "com.lantharos.Speech1.Models")]
impl Models {
    fn overview(&self) -> String {
        let preferences = preferences::read();
        let plan = Plan::now(None);
        let models: Vec<Model> = manifest::models()
            .iter()
            .map(|entry| Model {
                id: entry.id.clone(),
                engine: entry.engine,
                name: entry.name.clone(),
                licence: entry.licence.clone(),
                credit: entry.credit.clone(),
                homepage: entry.homepage.clone(),
                size: entry.size(),
                installed: self.hub.store.installed(entry),
                usage: self.hub.store.usage(entry),
                download: self
                    .hub
                    .downloads
                    .progress(&entry.id)
                    .map(|progress| Download {
                        received: progress.received,
                        total: progress.total,
                        problem: progress.problem,
                    }),
            })
            .collect();
        let needed = models
            .iter()
            .filter(|model| model.id == plan.model.id && !model.installed)
            .map(|model| model.id.clone())
            .collect();
        let overview = Overview {
            models,
            languages: language::all(preferences.engine),
            language: Language {
                name: language::name(&plan.spoken.code)
                    .unwrap_or("English")
                    .to_owned(),
                code: plan.spoken.code,
                engine: plan.engine,
            },
            engine: plan.engine,
            needed,
        };
        serde_json::to_string(&overview).expect("the overview always serializes")
    }

    fn install(&self, model: String) -> Result<(), Error> {
        let entry = manifest::find(&model)
            .ok_or_else(|| Error::Failed(format!("There's no model called {model}")))?;
        self.hub.store.remove_unlisted()?;
        let hub = self.hub.clone();
        self.hub
            .downloads
            .start(entry, self.hub.store.folder(entry), move || hub.changed());
        self.hub.changed();
        Ok(())
    }

    fn cancel_install(&self, model: String) {
        self.hub.downloads.cancel(&model);
        self.hub.changed();
    }

    fn remove(&self, model: String) -> Result<(), Error> {
        let entry = manifest::find(&model)
            .ok_or_else(|| Error::Failed(format!("There's no model called {model}")))?;
        self.hub.downloads.cancel(&model);
        self.hub.store.remove(entry)?;
        self.hub.changed();
        Ok(())
    }
}
