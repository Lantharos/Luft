use std::path::PathBuf;
use std::sync::Arc;

use luft_dbus_macros::introspect;
use tokio::sync::mpsc;
use zbus::object_server::{InterfaceRef, SignalEmitter};
use zbus::{ObjectServer, fdo, interface};

use crate::app::App;
use crate::config::{Config, Visibility};
use crate::events::{Event, Offered, Peer};
use crate::localsend::send::What;

pub const NAME: &str = "com.lantharos.Kestrel.Post";
pub const PATH: &str = "/com/lantharos/Kestrel/Post";
const PIN_DIGITS: usize = 6;

/// Post on the session bus, for Kestrel and Settings: who's nearby, sending to them, and what they send.
pub struct Post {
    app: Arc<App>,
    alias: String,
    folder: String,
    devices: Vec<Peer>,
    scanning: bool,
    listening: bool,
}

impl Post {
    pub fn new(app: Arc<App>) -> Self {
        Self { app, alias: String::new(), folder: String::new(), devices: Vec::new(), scanning: false, listening: true }
    }
}

fn new_pin() -> String {
    let mut bytes = [0u8; PIN_DIGITS];
    getrandom::fill(&mut bytes).expect("the system has randomness");
    bytes.iter().map(|byte| char::from(b'0' + byte % 10)).collect()
}

#[introspect]
#[interface(name = "com.lantharos.Kestrel.Post")]
impl Post {
    /// The name other devices see.
    #[zbus(property)]
    fn alias(&self) -> String {
        self.alias.clone()
    }

    /// Where received files go.
    #[zbus(property)]
    fn folder(&self) -> String {
        self.folder.clone()
    }

    /// The devices nearby: id, name, kind such as `mobile`, model, and whether its certificate proved its id.
    #[zbus(property)]
    fn devices(&self) -> Vec<Peer> {
        self.devices.clone()
    }

    #[zbus(property)]
    fn scanning(&self) -> bool {
        self.scanning
    }

    /// Whether Post has its port, which another app may hold instead.
    #[zbus(property)]
    fn listening(&self) -> bool {
        self.listening
    }

    /// What people chose: `no-one`, `your-devices` or `everyone`, a name and a folder (empty for the defaults), and
    /// the fingerprints of their devices.
    fn configure(&self, visibility: &str, name: &str, folder: &str, trusted: Vec<String>) -> fdo::Result<()> {
        let visibility = Visibility::parse(visibility).ok_or_else(|| fdo::Error::InvalidArgs(format!("{visibility} isn't a visibility")))?;
        let folder = Some(folder).filter(|folder| !folder.is_empty()).map(PathBuf::from);
        self.app.configure(Config { visibility, alias: Some(name.to_owned()), folder, trusted });
        Ok(())
    }

    fn scan(&self) {
        self.app.scans.notify_one();
    }

    /// Starts sending files and folders, and returns the transfer's id.
    fn send(&self, device: &str, paths: Vec<String>) -> String {
        self.app.outbox.send(&self.app, device, What::Files(paths.into_iter().map(PathBuf::from).collect()))
    }

    /// Starts sending text, which the other device shows or puts on its clipboard, and returns the transfer's id.
    fn send_text(&self, device: &str, text: String) -> String {
        self.app.outbox.send(&self.app, device, What::Text(text))
    }

    fn accept(&self, id: &str) {
        self.app.inbox.accept(id);
    }

    fn decline(&self, id: &str) {
        self.app.inbox.decline(id);
    }

    fn cancel(&self, id: &str) {
        self.app.inbox.cancel(&self.app, id);
        self.app.outbox.cancel(id);
    }

    fn answer_pin(&self, id: &str, pin: String) {
        self.app.outbox.pin(id, pin);
    }

    /// Lets nearby devices find this computer while Settings adds one of your devices, and returns the PIN it enters.
    fn start_pairing(&self) -> fdo::Result<String> {
        if self.app.visibility() == Visibility::NoOne {
            return Err(fdo::Error::Failed("No one can find this computer".into()));
        }
        let pin = new_pin();
        self.app.inbox.forget_attempts();
        *self.app.pairing.lock().unwrap() = Some(pin.clone());
        self.app.scans.notify_one();
        Ok(pin)
    }

    fn stop_pairing(&self) {
        self.app.pairing.lock().unwrap().take();
    }

    /// A device offers files, which wait for `Accept` or `Decline`.
    #[zbus(signal)]
    async fn offer(emitter: &SignalEmitter<'_>, id: &str, from: &Peer, files: &[Offered], size: u64) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn text(emitter: &SignalEmitter<'_>, from: &Peer, text: &str, trusted: bool) -> zbus::Result<()>;

    /// How a transfer is going: `direction` is `in` or `out`, `stage` `waiting`, `pin`, `wrong-pin` or `moving`, and
    /// `progress` the bytes done, the bytes in all and the number of files.
    #[zbus(signal)]
    async fn transfer(emitter: &SignalEmitter<'_>, id: &str, direction: &str, device: &str, stage: &str, progress: (u64, u64, u32)) -> zbus::Result<()>;

    /// A transfer ended: `outcome` is `done`, `declined`, `cancelled`, `cancelled-there`, `busy`, `unreachable` or
    /// `failed`, and `saved` the files that arrived.
    #[zbus(signal)]
    async fn finished(emitter: &SignalEmitter<'_>, id: &str, direction: &str, device: &str, outcome: &str, saved: &[String]) -> zbus::Result<()>;

    /// A device entered the PIN Settings showed and is one of your devices now.
    #[zbus(signal)]
    async fn paired(emitter: &SignalEmitter<'_>, device: &Peer) -> zbus::Result<()>;
}

/// Passes what Post's parts say on to the bus, in order.
pub async fn pump(server: ObjectServer, mut events: mpsc::UnboundedReceiver<Event>) {
    let Ok(post) = server.interface::<_, Post>(PATH).await else { return };
    while let Some(event) = events.recv().await {
        if let Err(error) = forward(&post, event).await {
            eprintln!("kestrel-post: couldn't tell Kestrel: {error}");
        }
    }
}

fn lossy(paths: Vec<PathBuf>) -> Vec<String> {
    paths.into_iter().map(|path| path.to_string_lossy().into_owned()).collect()
}

async fn forward(post: &InterfaceRef<Post>, event: Event) -> zbus::Result<()> {
    let emitter = post.signal_emitter();
    match event {
        Event::Ready { alias, folder } => {
            let mut shown = post.get_mut().await;
            let folder = folder.to_string_lossy().into_owned();
            if shown.alias != alias {
                shown.alias = alias;
                shown.alias_changed(emitter).await?;
            }
            if shown.folder != folder {
                shown.folder = folder;
                shown.folder_changed(emitter).await?;
            }
        }
        Event::Listening { listening } => {
            let mut shown = post.get_mut().await;
            if shown.listening != listening {
                shown.listening = listening;
                shown.listening_changed(emitter).await?;
            }
        }
        Event::Devices { devices } => {
            let mut shown = post.get_mut().await;
            shown.devices = devices;
            shown.devices_changed(emitter).await?;
        }
        Event::Scanning { scanning } => {
            let mut shown = post.get_mut().await;
            if shown.scanning != scanning {
                shown.scanning = scanning;
                shown.scanning_changed(emitter).await?;
            }
        }
        Event::Text { from, text, trusted } => Post::text(emitter, &from, &text, trusted).await?,
        Event::Offer { id, from, files, size } => Post::offer(emitter, &id, &from, &files, size).await?,
        Event::Transfer { id, direction, device, stage, done, size, files } => {
            Post::transfer(emitter, &id, direction.name(), &device, stage.name(), (done, size, files as u32)).await?;
        }
        Event::Finished { id, direction, device, outcome, saved } => {
            Post::finished(emitter, &id, direction.name(), &device, outcome.name(), &lossy(saved)).await?;
        }
        Event::Paired { device } => Post::paired(emitter, &device).await?,
    }
    Ok(())
}
