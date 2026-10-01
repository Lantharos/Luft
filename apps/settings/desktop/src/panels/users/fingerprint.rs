use std::sync::{Mutex, OnceLock};

use luft_app::Events;
use luft_app::dbus;
use serde::{Deserialize, Serialize};
use zbus::blocking::{MessageIterator, Proxy};
use zbus::message::Type;
use zbus::proxy::MethodFlags;
use zbus::zvariant::OwnedObjectPath;

const PROGRESS: &str = "users.fingerprint";

const SERVICE: &str = "net.reactivated.Fprint";
const MANAGER_PATH: &str = "/net/reactivated/Fprint/Manager";
const MANAGER: &str = "net.reactivated.Fprint.Manager";
const DEVICE: &str = "net.reactivated.Fprint.Device";
const CURRENT_USER: &str = "";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Fingerprints {
    swipe: bool,
    stages: i32,
    enrolled: Vec<String>,
}

#[derive(Deserialize)]
pub struct Finger {
    finger: String,
}

#[derive(Serialize)]
struct Progress {
    result: String,
    done: bool,
}

static ENROLLING: Mutex<Option<Proxy<'static>>> = Mutex::new(None);
static LISTENING: OnceLock<()> = OnceLock::new();

fn explain(error: zbus::Error) -> String {
    let name = match &error {
        zbus::Error::MethodError(name, _, _) => name.as_str(),
        _ => "",
    };
    match name.rsplit('.').next() {
        Some("PermissionDenied") => "You don't have permission to change fingerprints",
        Some("AlreadyInUse") => "The fingerprint reader is busy",
        Some("PrintsNotDeleted") => "Couldn't remove this fingerprint",
        _ => "Something went wrong with the fingerprint reader",
    }
    .to_owned()
}

fn reader() -> Option<Proxy<'static>> {
    let system = dbus::system().ok()?;
    let manager = Proxy::new(system, SERVICE, MANAGER_PATH, MANAGER).ok()?;
    let path: OwnedObjectPath = manager.call("GetDefaultDevice", &()).ok()?;
    Proxy::new(system, SERVICE, path, DEVICE).ok()
}

pub fn reader_present() -> bool {
    let Ok(system) = dbus::system() else {
        return false;
    };
    Proxy::new(system, SERVICE, MANAGER_PATH, MANAGER)
        .and_then(|manager| manager.call::<_, _, Vec<OwnedObjectPath>>("GetDevices", &()))
        .is_ok_and(|devices| !devices.is_empty())
}

fn call(
    reader: &Proxy,
    method: &str,
    body: &(impl serde::Serialize + zbus::zvariant::DynamicType),
) -> Result<(), String> {
    reader
        .call_with_flags::<_, _, ()>(method, MethodFlags::AllowInteractiveAuth.into(), body)
        .map(drop)
        .map_err(explain)
}

pub fn list() -> Option<Fingerprints> {
    let reader = reader()?;
    Some(Fingerprints {
        swipe: reader.get_property::<String>("scan-type").ok().as_deref() == Some("swipe"),
        stages: reader.get_property("num-enroll-stages").unwrap_or(0),
        enrolled: reader
            .call("ListEnrolledFingers", &(CURRENT_USER,))
            .unwrap_or_default(),
    })
}

pub fn delete(Finger { finger }: Finger) -> Result<(), String> {
    let reader = reader().ok_or("There's no fingerprint reader")?;
    call(&reader, "Claim", &(CURRENT_USER,))?;
    let deleted = call(&reader, "DeleteEnrolledFinger", &(finger,));
    let _ = reader.call_method("Release", &());
    deleted
}

pub fn enroll(events: &Events, Finger { finger }: Finger) -> Result<(), String> {
    LISTENING.get_or_init(|| listen(events.clone()));
    let reader = reader().ok_or("There's no fingerprint reader")?;
    call(&reader, "Claim", &(CURRENT_USER,))?;
    if let Err(error) = call(&reader, "EnrollStart", &(finger,)) {
        let _ = reader.call_method("Release", &());
        return Err(error);
    }
    *ENROLLING.lock().unwrap() = Some(reader);
    Ok(())
}

pub fn stop() {
    if let Some(reader) = ENROLLING.lock().unwrap().take() {
        let _ = reader.call_method("EnrollStop", &());
        let _ = reader.call_method("Release", &());
    }
}

fn listen(events: Events) {
    std::thread::spawn(move || {
        let Ok(system) = dbus::system() else {
            return;
        };
        let Ok(rule) = zbus::MatchRule::builder()
            .msg_type(Type::Signal)
            .sender(SERVICE)
            .and_then(|rule| rule.interface(DEVICE))
            .and_then(|rule| rule.member("EnrollStatus"))
            .map(|rule| rule.build())
        else {
            return;
        };
        let Ok(messages) = MessageIterator::for_match_rule(rule, system, None) else {
            return;
        };
        for message in messages.flatten() {
            let Ok((result, done)) = message.body().deserialize::<(String, bool)>() else {
                continue;
            };
            if ENROLLING.lock().unwrap().is_none() {
                continue;
            }
            events.emit(PROGRESS, Progress { result, done });
            if done {
                stop();
            }
        }
    });
}
