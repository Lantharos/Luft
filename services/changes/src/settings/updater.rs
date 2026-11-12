use luft_dbus_macros::introspect;
use luft_variant::Channel;
use serde_json::Value as Json;
use zbus::{Connection, proxy};

const STABLE_UNKNOWN: &str =
    "Couldn’t check whether a stable version is out. Try again when you’re online.";
const NOT_FROM_AN_IMAGE: &str = "This system doesn't get its updates from an image.";

#[introspect]
#[proxy(
    interface = "com.lantharos.Updater1",
    default_service = "com.lantharos.Updater1",
    default_path = "/com/lantharos/Updater1"
)]
trait Updater {
    fn status(&self) -> zbus::Result<String>;

    fn stable_released(&self) -> zbus::Result<String>;

    fn switch_channel(&self, channel: &str) -> zbus::Result<bool>;

    fn set_schedule(&self, schedule: &str, download: bool) -> zbus::Result<()>;

    #[zbus(property)]
    fn schedule(&self) -> zbus::Result<String>;

    #[zbus(property)]
    fn download_automatically(&self) -> zbus::Result<bool>;
}

/// The channel the system follows, or the one it waits to move to.
fn chosen(status: &Json) -> Option<Channel> {
    let waiting = status["waiting"].as_str().and_then(Channel::named);
    let followed = status["host"]["spec"]["image"]["image"]
        .as_str()
        .and_then(Channel::of);
    waiting.or(followed)
}

pub async fn channel(system: &Connection) -> zbus::Result<Channel> {
    let status = UpdaterProxy::new(system).await?.status().await?;
    serde_json::from_str(&status)
        .ok()
        .as_ref()
        .and_then(chosen)
        .ok_or_else(|| zbus::Error::Failure(NOT_FROM_AN_IMAGE.to_owned()))
}

pub async fn schedule(system: &Connection) -> zbus::Result<(String, bool)> {
    let updater = UpdaterProxy::new(system).await?;
    Ok((
        updater.schedule().await?,
        updater.download_automatically().await?,
    ))
}

/// Changes how often updates are looked for, whether they download, or both,
/// keeping whichever wasn't asked for.
pub async fn set_schedule(
    system: &Connection,
    every: Option<&str>,
    download: Option<bool>,
) -> zbus::Result<()> {
    let (current, downloads) = schedule(system).await?;
    UpdaterProxy::new(system)
        .await?
        .set_schedule(every.unwrap_or(&current), download.unwrap_or(downloads))
        .await
}

/// Moves to `channel` the way Settings offers it: stable only once the
/// registry could say whether a stable version is out.
pub async fn switch_channel(system: &Connection, channel: &str) -> Result<(), String> {
    let updater = UpdaterProxy::new(system)
        .await
        .map_err(|error| luft_dbus::explain(&error))?;
    if channel == Channel::Stable.name()
        && !matches!(updater.stable_released().await.as_deref(), Ok("yes" | "no"))
    {
        return Err(STABLE_UNKNOWN.to_owned());
    }
    updater
        .switch_channel(channel)
        .await
        .map(drop)
        .map_err(|error| luft_dbus::explain(&error))
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{Channel, chosen};

    #[test]
    fn a_system_waiting_for_a_channel_has_chosen_it() {
        let following = |image: &str, waiting: Option<&str>| json!({ "host": { "spec": { "image": { "image": image } } }, "waiting": waiting });
        assert_eq!(
            chosen(&following("ghcr.io/lantharos/luft:1-nightly", None)),
            Some(Channel::Nightly)
        );
        assert_eq!(
            chosen(&following(
                "ghcr.io/lantharos/luft:1-nightly",
                Some("stable")
            )),
            Some(Channel::Stable)
        );
        assert_eq!(chosen(&following("ghcr.io/lantharos/luft:1.2", None)), None);
    }
}
