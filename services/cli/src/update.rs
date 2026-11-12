use std::io::Write;

use luft_dbus_macros::introspect;
use luft_software::progress::Progress;
use luft_software::system::image::{self, Deployments, Section, StableRelease, Update};
use luft_software::task::{Cancel, Task};
use serde::Serialize;
use zbus::proxy;

use crate::bus;
use crate::changes::{self, Request};
use crate::cli::{Channel, UpdateAction};
use crate::failure::{Failure, Outcome};
use crate::output::{Output, bytes, table};
use crate::status::shown;

#[introspect]
#[proxy(
    interface = "org.gnome.SessionManager",
    default_service = "org.gnome.SessionManager",
    default_path = "/org/gnome/SessionManager"
)]
trait SessionManager {
    fn reboot(&self) -> zbus::Result<()>;
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Found {
    available: bool,
    version: Option<String>,
    download_size: Option<u64>,
    notes: Vec<Section>,
}

impl Found {
    fn of(update: Option<Update>) -> Self {
        match update {
            Some(update) => Self {
                available: true,
                version: update.release.version,
                download_size: Some(update.size),
                notes: update.release.notes.unwrap_or_default(),
            },
            None => Self {
                available: false,
                version: None,
                download_size: None,
                notes: Vec::new(),
            },
        }
    }

    fn words(&self) -> String {
        if !self.available {
            return "Luft is up to date.".to_owned();
        }
        let mut words = format!(
            "{} is available, {} to download.\n",
            self.version
                .as_deref()
                .map_or_else(|| "An update".to_owned(), shown),
            bytes(self.download_size.unwrap_or_default())
        );
        for section in &self.notes {
            words.push_str(&format!("\n{}\n", section.title));
            for change in &section.changes {
                words.push_str(&format!("  • {change}\n"));
            }
        }
        words
    }
}

pub async fn found() -> Outcome<Found> {
    Ok(Found::of(check().await?))
}

async fn check() -> Outcome<Option<Update>> {
    let deployments = Deployments::load().await.map_err(Failure::unavailable)?;
    deployments.check().map_err(Failure::failed)
}

fn report(json: bool) -> impl Fn(Progress) + Sync {
    move |progress: Progress| {
        if json {
            return;
        }
        let Some(fraction) = progress.fraction else {
            return;
        };
        eprint!(
            "\r{} {:>3}%",
            progress.stage.name(),
            (fraction * 100.0).round()
        );
        let _ = std::io::stderr().flush();
    }
}

async fn download(output: Output) -> Outcome {
    let update = check()
        .await?
        .ok_or_else(|| Failure::invalid("There's no update to download."))?;
    let cancel = Cancel::default();
    let report = report(output.json);
    image::download(
        Some(update.size),
        Task {
            report: &report,
            cancel: &cancel,
        },
    )
    .await
    .map_err(Failure::failed)?;
    if !output.json {
        eprintln!();
    }
    let version = update.release.version;
    output.show(&serde_json::json!({ "downloaded": version }), || {
        format!(
            "{} is ready. It installs when you restart.",
            version
                .as_deref()
                .map_or_else(|| "The update".to_owned(), shown)
        )
    })
}

async fn install(output: Output) -> Outcome {
    let deployments = Deployments::load().await.map_err(Failure::unavailable)?;
    if deployments.status().staged.is_none() {
        return Err(Failure::invalid(
            "No update is downloaded yet. Download one with luft update download.",
        ));
    }
    SessionManagerProxy::new(bus::session().await?)
        .await?
        .reboot()
        .await?;
    output.show(&serde_json::json!({ "restart": "asked" }), || {
        "Confirm the restart on the screen to install the update.".to_owned()
    })
}

async fn rollback(output: Output) -> Outcome {
    image::rollback().await.map_err(Failure::failed)?;
    output.show(&serde_json::json!({ "rollback": true }), || {
        "The previous version starts at the next restart.".to_owned()
    })
}

pub fn run(action: Option<UpdateAction>, output: Output) -> Outcome {
    bus::block_on(async {
        match action.unwrap_or(UpdateAction::Check) {
            UpdateAction::Check => {
                let found = found().await?;
                output.show(&found, || found.words())
            }
            UpdateAction::Download => download(output).await,
            UpdateAction::Install => install(output).await,
            UpdateAction::Rollback => rollback(output).await,
        }
    })?
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ChannelState {
    channel: Option<&'static str>,
    waiting: bool,
    stable_released: Option<bool>,
}

async fn channel_state() -> Outcome<ChannelState> {
    let deployments = Deployments::load().await.map_err(Failure::unavailable)?;
    let choice = deployments.channel_choice();
    Ok(ChannelState {
        channel: choice.map(|choice| choice.chosen.name()),
        waiting: choice.is_some_and(|choice| choice.waiting),
        stable_released: match image::stable_release().await {
            StableRelease::Released => Some(true),
            StableRelease::NotYet => Some(false),
            StableRelease::Unknown => None,
        },
    })
}

pub fn channel(channel: Option<Channel>, output: Output) -> Outcome {
    let Some(channel) = channel else {
        let state = bus::block_on(channel_state())??;
        return output.show(&state, || {
            table([
                ("Channel", state.channel.unwrap_or("unknown").to_owned()),
                (
                    "Moving",
                    if state.waiting {
                        "once the channel catches up"
                    } else {
                        "no"
                    }
                    .to_owned(),
                ),
                (
                    "Stable out",
                    match state.stable_released {
                        Some(true) => "yes",
                        Some(false) => "not yet",
                        None => "couldn't check",
                    }
                    .to_owned(),
                ),
            ])
        });
    };
    let name = match channel {
        Channel::Stable => "stable",
        Channel::Nightly => "nightly",
    };
    changes::apply(Request::from_pairs([("updates.channel", name)])?, output)
}
