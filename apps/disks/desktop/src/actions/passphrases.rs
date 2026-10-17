use std::collections::HashMap;

use futures_util::StreamExt;
use luft_app::dbus::{self, failed};
use zbus::wire::DynamicDeserialize;
use zbus::{DynamicType, OwnedObjectPath, OwnedVariant, Proxy, Variant};

const SERVICE: &str = "org.freedesktop.secrets";
const ROOT: &str = "/org/freedesktop/secrets";
const DEFAULT_COLLECTION: &str = "/org/freedesktop/secrets/aliases/default";
const SECRETS: &str = "org.freedesktop.Secret.Service";
const COLLECTION: &str = "org.freedesktop.Secret.Collection";
const ITEM: &str = "org.freedesktop.Secret.Item";
const PROMPT: &str = "org.freedesktop.Secret.Prompt";
const NO_PROMPT: &str = "/";

const SCHEMA: &str = "org.gnome.GVfs.Luks.Password";
const UUID: &str = "gvfs-luks-uuid";

type Secret = (OwnedObjectPath, Vec<u8>, Vec<u8>, String);

async fn call<R>(
    path: &str,
    interface: &str,
    method: &str,
    body: &(impl serde::Serialize + DynamicType),
) -> Result<R, String>
where
    R: for<'a> DynamicDeserialize<'a>,
{
    dbus::session()
        .await?
        .call_method(Some(SERVICE), path, Some(interface), method, body)
        .await
        .and_then(|reply| reply.body().deserialize::<R>())
        .map_err(failed)
}

async fn session() -> Result<OwnedObjectPath, String> {
    let (_, session): (OwnedVariant, OwnedObjectPath) =
        call(ROOT, SECRETS, "OpenSession", &("plain", Variant::from(""))).await?;
    Ok(session)
}

async fn prompt(path: OwnedObjectPath) -> Result<Option<OwnedVariant>, String> {
    if path.as_str() == NO_PROMPT {
        return Ok(None);
    }
    let proxy = Proxy::new(dbus::session().await?, SERVICE, path, PROMPT)
        .await
        .map_err(failed)?;
    let mut completed = proxy.receive_signal("Completed").await.map_err(failed)?;
    proxy.call_method("Prompt", &("",)).await.map_err(failed)?;
    let Some(signal) = completed.next().await else {
        return Ok(None);
    };
    let (dismissed, result): (bool, OwnedVariant) = signal.body().deserialize().map_err(failed)?;
    Ok((!dismissed).then_some(result))
}

async fn items(uuid: &str) -> Result<Vec<OwnedObjectPath>, String> {
    let (mut unlocked, locked): (Vec<OwnedObjectPath>, Vec<OwnedObjectPath>) = call(
        ROOT,
        SECRETS,
        "SearchItems",
        &(HashMap::from([(UUID, uuid)]),),
    )
    .await?;
    if !locked.is_empty() {
        let (opened, waiting): (Vec<OwnedObjectPath>, OwnedObjectPath) =
            call(ROOT, SECRETS, "Unlock", &(&locked,)).await?;
        unlocked.extend(opened);
        if let Some(result) = prompt(waiting).await? {
            unlocked.extend(Vec::<OwnedObjectPath>::try_from(result).unwrap_or_default());
        }
    }
    Ok(unlocked)
}

pub async fn load(uuid: &str) -> Option<String> {
    let item = items(uuid).await.ok()?.into_iter().next()?;
    let session = session().await.ok()?;
    let (_, _, value, _): Secret = call(item.as_str(), ITEM, "GetSecret", &(&session,))
        .await
        .ok()?;
    String::from_utf8(value).ok()
}

pub async fn store(uuid: &str, name: &str, passphrase: &str) -> Result<(), String> {
    delete(uuid).await;
    let session = session().await?;
    let label = format!("Encryption passphrase for {name}");
    let attributes = HashMap::from([("xdg:schema", SCHEMA), (UUID, uuid)]);
    let properties = HashMap::from([
        (
            "org.freedesktop.Secret.Item.Label",
            Variant::from(label.as_str()),
        ),
        (
            "org.freedesktop.Secret.Item.Attributes",
            Variant::from(attributes),
        ),
    ]);
    let secret = (
        &session,
        Vec::<u8>::new(),
        passphrase.as_bytes(),
        "text/plain",
    );
    let (_, waiting): (OwnedObjectPath, OwnedObjectPath) = call(
        DEFAULT_COLLECTION,
        COLLECTION,
        "CreateItem",
        &(properties, secret, true),
    )
    .await?;
    prompt(waiting).await?;
    Ok(())
}

pub async fn delete(uuid: &str) {
    for item in items(uuid).await.unwrap_or_default() {
        if let Ok(waiting) = call::<OwnedObjectPath>(item.as_str(), ITEM, "Delete", &()).await {
            let _ = prompt(waiting).await;
        }
    }
}
