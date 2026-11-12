use std::io::{BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::Arc;

use luft_dbus::idle::Idle;
use luft_dbus_macros::introspect;
use zbus::connection::Builder;
use zbus::{Connection, interface};

use super::{NAME, PATH, Packages};

const FOLDER: &str = "/var/home/mara/.local/share/luft/extensions/com.example.Clock";
const GREETER_PATH: &str = "/com/lantharos/Greeter1";

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

async fn refusal(caller: &Connection) -> String {
    caller
        .call_method(
            Some(NAME),
            PATH,
            Some(NAME),
            "AllowExtensionFolder",
            &("com.example.Clock", FOLDER),
        )
        .await
        .unwrap_err()
        .to_string()
}

#[tokio::test]
async fn an_unreviewed_extension_is_refused_without_developer_tools_and_to_all_but_settings() {
    let bus = Bus::start();
    let greeter = bus
        .connect()
        .serve_at(
            GREETER_PATH,
            Greeter {
                developer_tools: false,
            },
        )
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
    assert!(refusal(&caller).await.contains("Developer tools"));

    greeter
        .object_server()
        .interface::<_, Greeter>(GREETER_PATH)
        .await
        .unwrap()
        .get_mut()
        .await
        .developer_tools = true;
    assert!(refusal(&caller).await.contains("Only Luft's Settings"));
}
