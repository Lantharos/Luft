mod device;
mod radios;

use std::borrow::Cow;
use std::collections::HashMap;

use futures_util::StreamExt;
use tokio::sync::mpsc;
use zbus::fdo::{ObjectManagerProxy, Properties};
use zbus::names::InterfaceName;
use zbus::object_server::InterfaceRef;
use zbus::proxy;
use zbus::zvariant::Value;

use crate::context::Context;
use crate::shared::remote::{Endpoint, RemoteProperty};
use crate::shared::system::HostnameProxy;
use device::{ALL, BLUETOOTH, Rfkill, Switch, WWAN};
use radios::{Modems, Radios, Request, State};

const MODEM_MANAGER: &str = "org.freedesktop.ModemManager1";
const NETWORK_MANAGER: Endpoint = Endpoint {
    service: "org.freedesktop.NetworkManager",
    path: "/org/freedesktop/NetworkManager",
    interface: "org.freedesktop.NetworkManager",
};
const SESSION_MANAGER: Endpoint = Endpoint {
    service: "org.gnome.SessionManager",
    path: "/org/gnome/SessionManager",
    interface: "org.gnome.SessionManager",
};

#[proxy(
    interface = "org.freedesktop.NetworkManager",
    default_service = "org.freedesktop.NetworkManager",
    default_path = "/org/freedesktop/NetworkManager"
)]
trait NetworkManager {
    #[zbus(property)]
    fn set_wwan_enabled(&self, enabled: bool) -> zbus::Result<()>;
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let system = &context.system;
    let chassis = HostnameProxy::new(system)
        .await?
        .chassis()
        .await
        .unwrap_or_default();
    let mut switches: HashMap<u32, Switch> = HashMap::new();
    let mut rfkill = Rfkill::open()
        .and_then(|mut rfkill| rfkill.drain(&mut switches).map(|()| rfkill))
        .inspect_err(|error| eprintln!("Radio switches are unavailable: {error}"))
        .ok();
    let mut wwan = RemoteProperty::<bool>::new(system, &NETWORK_MANAGER, "WwanEnabled").await?;
    let modem_objects = ObjectManagerProxy::builder(system)
        .destination(MODEM_MANAGER)?
        .path("/org/freedesktop/ModemManager1")?
        .build()
        .await?;
    let mut modems_added = modem_objects.receive_interfaces_added().await?;
    let mut modems_removed = modem_objects.receive_interfaces_removed().await?;
    let mut modems = Modems {
        present: modems_present(&modem_objects).await,
        enabled: wwan.get().await.unwrap_or(false),
    };
    let mut session_active =
        RemoteProperty::<bool>::new(&context.session, &SESSION_MANAGER, "SessionIsActive").await?;
    let (requests, mut incoming) = mpsc::unbounded_channel();
    let state = State::of(&switches, &modems, &chassis);
    let server = context.session.object_server();
    server.at(radios::PATH, Radios { state, requests }).await?;
    context.session.request_name(radios::NAME).await?;
    let radios = server.interface::<_, Radios>(radios::PATH).await?;
    if let Some(rfkill) = &mut rfkill {
        take_radio_keys(rfkill, session_active.get().await.unwrap_or(true));
    }
    let network = NetworkManagerProxy::new(system).await?;
    tokio::spawn(async move {
        loop {
            tokio::select! {
                changed = async { rfkill.as_mut().expect("the switch device is open").changes(&mut switches).await }, if rfkill.is_some() => {
                    if let Err(error) = changed {
                        eprintln!("Lost the radio switches: {error}");
                        rfkill = None;
                    }
                }
                Some(request) = incoming.recv() => {
                    let (kind, blocked) = match request {
                        Request::Airplane(blocked) => (ALL, blocked),
                        Request::Bluetooth(blocked) => (BLUETOOTH, blocked),
                        Request::Wwan(blocked) => (WWAN, blocked),
                    };
                    if let Some(Err(error)) = rfkill.as_mut().map(|rfkill| rfkill.block_all(kind, blocked)) {
                        eprintln!("Couldn't switch the radios: {error}");
                    }
                    if kind != BLUETOOTH
                        && modems.present
                        && let Err(error) = network.set_wwan_enabled(!blocked).await
                    {
                        eprintln!("Couldn't switch the mobile broadband: {error}");
                    }
                    continue;
                }
                enabled = wwan.changed() => modems.enabled = enabled.unwrap_or(false),
                Some(_) = modems_added.next() => modems.present = modems_present(&modem_objects).await,
                Some(_) = modems_removed.next() => modems.present = modems_present(&modem_objects).await,
                active = session_active.changed() => {
                    if let Some(rfkill) = &mut rfkill {
                        take_radio_keys(rfkill, active.unwrap_or(true));
                    }
                    continue;
                }
            }
            publish(&radios, State::of(&switches, &modems, &chassis)).await;
        }
    });
    Ok(())
}

async fn modems_present(objects: &ObjectManagerProxy<'_>) -> bool {
    objects
        .get_managed_objects()
        .await
        .is_ok_and(|objects| !objects.is_empty())
}

fn take_radio_keys(rfkill: &mut Rfkill, take: bool) {
    if let Err(error) = rfkill.take_radio_keys(take) {
        eprintln!("Couldn't take over the radio keys from the kernel: {error}");
    }
}

async fn publish(radios: &InterfaceRef<Radios>, next: State) {
    let mut current = radios.get_mut().await;
    let previous = std::mem::replace(&mut current.state, next);
    let fields = [
        ("AirplaneMode", previous.airplane, next.airplane),
        ("HardwareAirplaneMode", previous.hardware, next.hardware),
        ("HasAirplaneMode", previous.has_airplane, next.has_airplane),
        (
            "ShouldShowAirplaneMode",
            previous.should_show,
            next.should_show,
        ),
        ("BluetoothAirplaneMode", previous.bluetooth, next.bluetooth),
        (
            "BluetoothHardwareAirplaneMode",
            previous.bluetooth_hardware,
            next.bluetooth_hardware,
        ),
        (
            "BluetoothHasAirplaneMode",
            previous.has_bluetooth,
            next.has_bluetooth,
        ),
        ("WwanAirplaneMode", previous.wwan, next.wwan),
        (
            "WwanHardwareAirplaneMode",
            previous.wwan_hardware,
            next.wwan_hardware,
        ),
        ("WwanHasAirplaneMode", previous.has_wwan, next.has_wwan),
    ];
    let changed: HashMap<&str, Value> = fields
        .into_iter()
        .filter(|(_, before, after)| before != after)
        .map(|(name, _, after)| (name, Value::from(after)))
        .collect();
    if changed.is_empty() {
        return;
    }
    let emitted = Properties::properties_changed(
        radios.signal_emitter(),
        InterfaceName::from_static_str_unchecked(radios::NAME),
        changed,
        Cow::Borrowed(&[]),
    );
    if let Err(error) = emitted.await {
        eprintln!("Couldn't announce the radio state: {error}");
    }
}
