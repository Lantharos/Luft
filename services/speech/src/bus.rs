use std::sync::Arc;

use luft_dbus_macros::introspect;
use luft_speech::types::{Download, Language, Model, Overview};
use zbus::fdo::DBusProxy;
use zbus::interface;
use zbus::message::Header;
use zbus::names::{BusName, UniqueName};
use zbus::object_server::SignalEmitter;

use crate::dictation::Session;
use crate::hub::Hub;
use crate::language;
use crate::models::manifest;
use crate::plan::Plan;

luft_dbus::errors!("com.lantharos.Speech1.Error" {
    NotInstalled,
    Unsupported,
    NotAllowed,
    UnknownModel,
});

pub const SHELL: BusName<'static> = BusName::WellKnown(
    zbus::names::WellKnownName::from_static_str_unchecked("com.lantharos.Kestrel"),
);

fn listed(model: &str) -> Result<&'static manifest::Entry, Error> {
    manifest::find(model)
        .ok_or_else(|| Error::UnknownModel(format!("There's no model called {model}.")))
}

fn language_name(code: &str) -> &'static str {
    language::name(code).unwrap_or("English")
}

pub struct Dictation {
    hub: Arc<Hub>,
    bus: DBusProxy<'static>,
}

impl Dictation {
    async fn require_shell(&self, header: &Header<'_>) -> Result<UniqueName<'static>, Error> {
        let owner = self.bus.get_name_owner(SHELL).await.ok();
        match (owner, header.sender()) {
            (Some(owner), Some(sender)) if *owner == *sender => Ok(sender.to_owned()),
            _ => Err(Error::NotAllowed(
                "Only the desktop can take dictation.".into(),
            )),
        }
    }
}

pub struct Models {
    hub: Arc<Hub>,
}

pub fn serve(hub: &Arc<Hub>, bus: DBusProxy<'static>) -> (Dictation, Models) {
    (
        Dictation {
            hub: hub.clone(),
            bus,
        },
        Models { hub: hub.clone() },
    )
}

#[introspect]
#[interface(name = "com.lantharos.Speech1")]
impl Dictation {
    async fn start(&self, #[zbus(header)] header: Header<'_>, layout: String) -> Result<(), Error> {
        let shell = self.require_shell(&header).await?;
        let plan = Plan::now(
            Some(layout.as_str()).filter(|layout| !layout.is_empty()),
            self.hub.processor,
        );
        if !self.hub.processor.runs(plan.engine) {
            return Err(Error::Unsupported(
                language_name(&plan.spoken.code).to_owned(),
            ));
        }
        if !self.hub.models.store.installed(plan.model) {
            return Err(Error::NotInstalled(plan.model.id.clone()));
        }
        let mut session = self.hub.session.lock().await;
        if let Some(previous) = session.take() {
            previous.cancel();
        }
        *self.hub.listener.lock().expect("listener lock") = Some(shell);
        *session = Some(Session::start(&self.hub, plan)?);
        Ok(())
    }

    async fn stop(&self, #[zbus(header)] header: Header<'_>) -> Result<String, Error> {
        self.require_shell(&header).await?;
        let session = self.hub.session.lock().await.take();
        match session {
            Some(session) => Ok(session.finish().await?),
            None => Ok(String::new()),
        }
    }

    async fn cancel(&self, #[zbus(header)] header: Header<'_>) -> Result<(), Error> {
        self.require_shell(&header).await?;
        if let Some(session) = self.hub.session.lock().await.take() {
            session.cancel();
        }
        Ok(())
    }

    #[zbus(signal)]
    pub async fn typed(emitter: &SignalEmitter<'_>, text: &str) -> zbus::Result<()>;

    #[zbus(signal)]
    pub async fn partial(emitter: &SignalEmitter<'_>, text: &str) -> zbus::Result<()>;

    #[zbus(signal)]
    pub async fn quiet(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;

    #[zbus(signal)]
    pub async fn level(emitter: &SignalEmitter<'_>, level: f64) -> zbus::Result<()>;
}

#[introspect]
#[interface(name = "com.lantharos.Speech1.Models")]
impl Models {
    fn overview(&self) -> String {
        let processor = self.hub.processor;
        let plan = Plan::now(None, processor);
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
                installed: self.hub.models.store.installed(entry),
                usage: self.hub.models.store.usage(entry),
                download: self
                    .hub
                    .models
                    .downloads
                    .progress(&entry.id)
                    .map(|progress| Download {
                        received: progress.received,
                        total: progress.total,
                        problem: progress.problem,
                    }),
            })
            .collect();
        let overview = Overview {
            models,
            languages: language::all(plan.choice),
            language: Language {
                name: language_name(&plan.spoken.code).to_owned(),
                code: plan.spoken.code,
                engine: plan.engine,
            },
            engine: plan.engine,
            engines: processor.engines(),
        };
        serde_json::to_string(&overview).expect("the overview always serializes")
    }

    fn install(&self, model: String) -> Result<(), Error> {
        self.hub.models.install(listed(&model)?)?;
        Ok(())
    }

    fn cancel_install(&self, model: String) {
        self.hub.models.cancel_install(&model);
    }

    fn remove(&self, model: String) -> Result<(), Error> {
        Ok(self.hub.models.remove(listed(&model)?)?)
    }

    #[zbus(signal)]
    pub async fn changed(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}
