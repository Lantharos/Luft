use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::{LazyLock, Mutex};

use luft_app::Events;
use luft_app::dbus::{self, failed};
use sabine::BridgeEvent;
use serde::Serialize;
use specta::Type;
use tokio::sync::oneshot;
use zbus::{ObjectPath, OwnedVariant, Proxy};

use super::{DEVICE, SERVICE};

pub const REQUEST: BridgeEvent<Request> = BridgeEvent::new("bluetooth.request");
pub const CANCEL: BridgeEvent<()> = BridgeEvent::new("bluetooth.cancel");

const PATH: &str = "/com/lantharos/Settings/BluetoothAgent";
const CAPABILITY: &str = "KeyboardDisplay";

#[derive(Serialize, Clone, Copy, Type)]
#[serde(rename_all = "lowercase")]
enum PairingKind {
    Confirm,
    Authorize,
    Pin,
    Passkey,
    Display,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Request {
    id: u32,
    device: String,
    name: String,
    kind: PairingKind,
    code: Option<String>,
}

#[derive(zbus::DBusError, Debug)]
#[zbus(prefix = "org.bluez.Error")]
enum Refusal {
    #[zbus(error)]
    ZBus(zbus::Error),
    Rejected,
    Canceled,
}

static NEXT_ID: AtomicU32 = AtomicU32::new(1);
static WAITING: LazyLock<Mutex<HashMap<u32, oneshot::Sender<Option<String>>>>> =
    LazyLock::new(Mutex::default);

struct Agent {
    events: Events,
}

async fn device_name(connection: &zbus::Connection, device: &ObjectPath<'_>) -> String {
    let reply = connection
        .call_method(
            Some(SERVICE),
            device,
            Some("org.freedesktop.DBus.Properties"),
            "Get",
            &(DEVICE, "Alias"),
        )
        .await;
    reply
        .ok()
        .and_then(|reply| reply.body().deserialize::<OwnedVariant>().ok())
        .and_then(|alias| String::try_from(alias).ok())
        .unwrap_or_default()
}

fn next_id() -> u32 {
    NEXT_ID.fetch_add(1, Ordering::Relaxed)
}

impl Agent {
    async fn show(
        &self,
        connection: &zbus::Connection,
        id: u32,
        device: &ObjectPath<'_>,
        kind: PairingKind,
        code: Option<String>,
    ) {
        self.events.emit(
            REQUEST,
            Request {
                id,
                device: device.to_string(),
                name: device_name(connection, device).await,
                kind,
                code,
            },
        );
    }

    async fn ask(
        &self,
        connection: &zbus::Connection,
        device: &ObjectPath<'_>,
        kind: PairingKind,
        code: Option<String>,
    ) -> Result<String, Refusal> {
        let id = next_id();
        let (answer, answered) = oneshot::channel();
        WAITING.lock().unwrap().insert(id, answer);
        self.show(connection, id, device, kind, code).await;
        match answered.await {
            Ok(Some(value)) => Ok(value),
            Ok(None) => Err(Refusal::Rejected),
            Err(_) => Err(Refusal::Canceled),
        }
    }
}

#[zbus::interface(name = "org.bluez.Agent1")]
impl Agent {
    fn release(&self) {
        cancel(&self.events);
    }

    async fn request_pin_code(
        &self,
        #[zbus(connection)] connection: &zbus::Connection,
        device: ObjectPath<'_>,
    ) -> Result<String, Refusal> {
        self.ask(connection, &device, PairingKind::Pin, None).await
    }

    async fn display_pin_code(
        &self,
        #[zbus(connection)] connection: &zbus::Connection,
        device: ObjectPath<'_>,
        pincode: String,
    ) {
        self.show(
            connection,
            next_id(),
            &device,
            PairingKind::Display,
            Some(pincode),
        )
        .await;
    }

    async fn request_passkey(
        &self,
        #[zbus(connection)] connection: &zbus::Connection,
        device: ObjectPath<'_>,
    ) -> Result<u32, Refusal> {
        let passkey = self
            .ask(connection, &device, PairingKind::Passkey, None)
            .await?;
        passkey.trim().parse().map_err(|_| Refusal::Rejected)
    }

    async fn display_passkey(
        &self,
        #[zbus(connection)] connection: &zbus::Connection,
        device: ObjectPath<'_>,
        passkey: u32,
        _entered: u16,
    ) {
        let code = format!("{passkey:06}");
        self.show(
            connection,
            next_id(),
            &device,
            PairingKind::Display,
            Some(code),
        )
        .await;
    }

    async fn request_confirmation(
        &self,
        #[zbus(connection)] connection: &zbus::Connection,
        device: ObjectPath<'_>,
        passkey: u32,
    ) -> Result<(), Refusal> {
        self.ask(
            connection,
            &device,
            PairingKind::Confirm,
            Some(format!("{passkey:06}")),
        )
        .await
        .map(drop)
    }

    async fn request_authorization(
        &self,
        #[zbus(connection)] connection: &zbus::Connection,
        device: ObjectPath<'_>,
    ) -> Result<(), Refusal> {
        self.ask(connection, &device, PairingKind::Authorize, None)
            .await
            .map(drop)
    }

    fn authorize_service(&self, _device: ObjectPath<'_>, _uuid: String) -> Result<(), Refusal> {
        Err(Refusal::Rejected)
    }

    fn cancel(&self) {
        cancel(&self.events);
    }
}

fn cancel(events: &Events) {
    WAITING.lock().unwrap().clear();
    events.emit(CANCEL, ());
}

pub fn answer(id: u32, value: Option<String>) {
    if let Some(waiting) = WAITING.lock().unwrap().remove(&id) {
        let _ = waiting.send(value);
    }
}

async fn manager() -> Result<Proxy<'static>, String> {
    Proxy::new(
        dbus::system().await?,
        SERVICE,
        "/org/bluez",
        "org.bluez.AgentManager1",
    )
    .await
    .map_err(failed)
}

pub async fn register(events: &Events) -> Result<(), String> {
    dbus::system()
        .await?
        .object_server()
        .at(
            PATH,
            Agent {
                events: events.clone(),
            },
        )
        .await
        .map_err(failed)?;
    let manager = manager().await?;
    let path = ObjectPath::from_static_str_unchecked(PATH);
    manager
        .call_method("RegisterAgent", &(&path, CAPABILITY))
        .await
        .map_err(failed)?;
    manager
        .call_method("RequestDefaultAgent", &(&path,))
        .await
        .map(drop)
        .map_err(failed)
}

pub async fn unregister(events: &Events) {
    cancel(events);
    if let Ok(manager) = manager().await {
        let _ = manager
            .call_method(
                "UnregisterAgent",
                &(ObjectPath::from_static_str_unchecked(PATH),),
            )
            .await;
    }
}
