use std::sync::{Mutex, OnceLock};

use futures_util::StreamExt;
use luft_app::dbus;
use luft_app::{Commands, Empty, Events};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use zbus::message::Type;
use zbus::proxy::MethodFlags;
use zbus::{DynamicType, MatchRule, MessageStream, OwnedObjectPath, Proxy};

pub const PROGRESS: BridgeEvent<Progress> = BridgeEvent::new("fingerprint.enroll");

const SERVICE: &str = "net.reactivated.Fprint";
const MANAGER_PATH: &str = "/net/reactivated/Fprint/Manager";
const MANAGER: &str = "net.reactivated.Fprint.Manager";
const DEVICE: &str = "net.reactivated.Fprint.Device";
const CURRENT_USER: &str = "";

#[derive(Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct Fingerprints {
    swipe: bool,
    stages: i32,
    enrolled: Vec<String>,
}

#[derive(Deserialize, specta::Type)]
struct Finger {
    finger: String,
}

#[derive(Serialize, specta::Type)]
pub struct Progress {
    pub result: String,
    pub done: bool,
}

static ENROLLING: Mutex<Option<Proxy<'static>>> = Mutex::new(None);
static LISTENING: OnceLock<()> = OnceLock::new();

fn explain(error: &zbus::Error) -> String {
    let name = dbus::error_name(error).unwrap_or_default();
    match name.rsplit('.').next() {
        Some("PermissionDenied") => "You don't have permission to change fingerprints",
        Some("AlreadyInUse") => "The fingerprint reader is busy",
        Some("PrintsNotDeleted") => "Couldn't remove this fingerprint",
        _ => "Something went wrong with the fingerprint reader",
    }
    .to_owned()
}

async fn manager() -> Option<Proxy<'static>> {
    Proxy::new(dbus::system().await.ok()?, SERVICE, MANAGER_PATH, MANAGER)
        .await
        .ok()
}

async fn reader() -> Option<Proxy<'static>> {
    let path: OwnedObjectPath = manager().await?.call("GetDefaultDevice", &()).await.ok()?;
    Proxy::new(dbus::system().await.ok()?, SERVICE, path, DEVICE)
        .await
        .ok()
}

pub async fn reader_present() -> bool {
    let Some(manager) = manager().await else {
        return false;
    };
    manager
        .call::<_, _, Vec<OwnedObjectPath>>("GetDevices", &())
        .await
        .is_ok_and(|devices| !devices.is_empty())
}

async fn call(
    reader: &Proxy<'_>,
    method: &str,
    body: &(impl Serialize + DynamicType),
) -> Result<(), String> {
    reader
        .call_with_flags::<_, _, ()>(method, MethodFlags::ALLOW_INTERACTIVE_AUTH, body)
        .await
        .map(drop)
        .map_err(|error| explain(&error))
}

async fn list(Empty {}: Empty) -> Result<Option<Fingerprints>, String> {
    let Some(reader) = reader().await else {
        return Ok(None);
    };
    Ok(Some(Fingerprints {
        swipe: reader
            .get_property::<String>("scan-type")
            .await
            .ok()
            .as_deref()
            == Some("swipe"),
        stages: reader.get_property("num-enroll-stages").await.unwrap_or(0),
        enrolled: reader
            .call("ListEnrolledFingers", &(CURRENT_USER,))
            .await
            .unwrap_or_default(),
    }))
}

async fn delete(Finger { finger }: Finger) -> Result<(), String> {
    let reader = reader().await.ok_or("There's no fingerprint reader")?;
    call(&reader, "Claim", &(CURRENT_USER,)).await?;
    let deleted = call(&reader, "DeleteEnrolledFinger", &(finger,)).await;
    let _ = reader.call_method("Release", &()).await;
    deleted
}

async fn enroll(events: Events, Finger { finger }: Finger) -> Result<(), String> {
    LISTENING.get_or_init(|| {
        luft_app::spawn(listen(events));
    });
    let reader = reader().await.ok_or("There's no fingerprint reader")?;
    call(&reader, "Claim", &(CURRENT_USER,)).await?;
    if let Err(error) = call(&reader, "EnrollStart", &(finger,)).await {
        let _ = reader.call_method("Release", &()).await;
        return Err(error);
    }
    *ENROLLING.lock().unwrap() = Some(reader);
    Ok(())
}

async fn stop() {
    let Some(reader) = ENROLLING.lock().unwrap().take() else {
        return;
    };
    let _ = reader.call_method("EnrollStop", &()).await;
    let _ = reader.call_method("Release", &()).await;
}

async fn listen(events: Events) {
    let Ok(system) = dbus::system().await else {
        return;
    };
    let Ok(rule) = MatchRule::builder()
        .msg_type(Type::Signal)
        .sender(SERVICE)
        .interface(DEVICE)
        .member("EnrollStatus")
        .build()
    else {
        return;
    };
    let Ok(mut messages) = MessageStream::for_match_rule(rule, system, None).await else {
        return;
    };
    while let Some(message) = messages.next().await {
        let Ok((result, done)) =
            message.and_then(|message| message.body().deserialize::<(String, bool)>())
        else {
            continue;
        };
        if ENROLLING.lock().unwrap().is_none() {
            continue;
        }
        events.emit(PROGRESS, Progress { result, done });
        if done {
            stop().await;
        }
    }
}

pub fn register_reader(window: SabineWindow) -> SabineWindow {
    window
        .command_async("fingerprint_reader", |Empty {}| async {
            Ok(reader_present().await)
        })
        .command_async("fingerprint_list", list)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    register_reader(window)
        .bridge_event(&PROGRESS)
        .with_async("fingerprint_enroll", events, enroll)
        .command_async("fingerprint_stop", |Empty {}| async {
            stop().await;
            Ok(())
        })
        .command_async("fingerprint_delete", delete)
}
