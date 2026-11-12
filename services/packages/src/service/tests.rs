use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::Arc;

use luft_dbus::idle::Idle;
use luft_dbus_macros::introspect;
use zbus::connection::Builder;
use zbus::{Connection, interface};

use super::{NAME, PATH, Packages};

const FOLDER: &str = "/var/home/mara/.local/share/luft/extensions/com.example.Clock";

struct Bus {
    daemon: Child,
    address: String,
}

impl Bus {
    fn start() -> Self {
        let mut daemon = Command::new("dbus-daemon")
            .args(["--session", "--nofork", "--print-address=1"])
            .stdout(Stdio::piped())
            .spawn()
            .expect("dbus-daemon runs");
        let mut address = String::new();
        BufReader::new(daemon.stdout.take().unwrap())
            .read_line(&mut address)
            .unwrap();
        Self {
            daemon,
            address: address.trim().to_owned(),
        }
    }

    fn connect(&self) -> Builder<'static> {
        Builder::address(self.address.as_str())
    }
}

impl Drop for Bus {
    fn drop(&mut self) {
        let _ = self.daemon.kill();
        let _ = self.daemon.wait();
    }
}

struct Greeter {
    developer_tools: bool,
}

#[introspect]
#[interface(name = "com.lantharos.Greeter1")]
impl Greeter {
    #[zbus(property)]
    fn developer_tools(&self) -> bool {
        self.developer_tools
    }
}

async fn refusal(bus: &Bus, developer_tools: bool) -> String {
    let _greeter = bus
        .connect()
        .serve_at("/com/lantharos/Greeter1", Greeter { developer_tools })
        .name("com.lantharos.Greeter1")
        .build()
        .await
        .unwrap();
    let _service = bus
        .connect()
        .serve_at(PATH, Packages::new(Arc::new(Idle::default())))
        .name(NAME)
        .build()
        .await
        .unwrap();
    let caller: Connection = bus.connect().build().await.unwrap();
    let error = caller
        .call_method(
            Some(NAME),
            PATH,
            Some(NAME),
            "AllowExtensionFolder",
            &("com.example.Clock", FOLDER),
        )
        .await
        .unwrap_err();
    error.to_string()
}

#[tokio::test]
async fn an_unreviewed_extension_is_refused_while_developer_tools_is_off() {
    let bus = Bus::start();
    assert!(refusal(&bus, false).await.contains("Developer tools"));
}

#[tokio::test]
async fn an_unreviewed_extension_is_refused_to_any_program_but_settings() {
    let bus = Bus::start();
    assert!(refusal(&bus, true).await.contains("Only Luft's Settings"));
}
