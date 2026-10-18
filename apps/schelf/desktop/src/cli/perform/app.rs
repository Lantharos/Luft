use futures_util::StreamExt;
use luft_app::block_on;
use luft_app::dbus::{self, failed};
use luft_software::progress::{Progress, Stage};
use luft_software::task::Cancel;
use zbus::fdo::DBusProxy;
use zbus::names::BusName;

use super::Failure;
use crate::cli::terminal::progress::{Status, Update};
use crate::operations::bus::{NAME, SchelfProxy};
use crate::operations::{Request, State};

const CLOSED: &str = "Schelf closed before it finished.";

pub async fn connect() -> Option<SchelfProxy<'static>> {
    let connection = dbus::session().await.ok()?;
    let name = BusName::try_from(NAME).ok()?;
    let open = DBusProxy::new(connection)
        .await
        .ok()?
        .name_has_owner(name)
        .await
        .ok()?;
    if !open {
        return None;
    }
    SchelfProxy::new(connection).await.ok()
}

fn update(state: &str, stage: &str, fraction: f64) -> Update {
    if state == State::Queued.name() {
        return Update::Queued;
    }
    Update::Progress(Progress::new(
        Stage::named(stage).unwrap_or(Stage::Preparing),
        (fraction >= 0.0).then_some(fraction as f32),
    ))
}

async fn follow(
    proxy: &SchelfProxy<'static>,
    request: &str,
    status: &Status<'_>,
    cancel: &Cancel,
) -> Result<(), String> {
    let mut changes = proxy.receive_changed().await.map_err(failed)?;
    let mut finishes = proxy.receive_finished().await.map_err(failed)?;
    let mut owners = proxy
        .inner()
        .receive_owner_changed()
        .await
        .map_err(failed)?;
    let id = proxy
        .start(request)
        .await
        .map_err(|error| dbus::explain(&error))?;
    let stopper = proxy.clone();
    let wait = async {
        loop {
            tokio::select! {
                Some(change) = changes.next() => {
                    let change = change.args().map_err(failed)?;
                    if change.id == id {
                        status.show(update(&change.state, &change.stage, change.fraction));
                    }
                }
                Some(finish) = finishes.next() => {
                    let finish = finish.args().map_err(failed)?;
                    if finish.id == id {
                        return if finish.error.is_empty() { Ok(()) } else { Err(finish.error) };
                    }
                }
                Some(owner) = owners.next() => {
                    if owner.is_none() {
                        return Err(CLOSED.to_owned());
                    }
                }
                else => return Err(CLOSED.to_owned()),
            }
        }
    };
    let stop = move || {
        let stopper = stopper.clone();
        luft_app::spawn(async move {
            let _ = stopper.cancel(id).await;
        });
    };
    match cancel.while_awaiting(stop, wait).await {
        Some(result) => result,
        None => {
            let _ = proxy.cancel(id).await;
            Err(luft_software::task::CANCELLED.to_owned())
        }
    }
}

pub fn run(
    proxy: &SchelfProxy<'static>,
    request: &Request,
    status: &Status,
    cancel: &Cancel,
) -> Result<(), Failure> {
    let request = serde_json::to_string(request).map_err(|error| error.to_string())?;
    block_on(follow(proxy, &request, status, cancel)).map_err(Failure::from)
}
