use std::path::PathBuf;
use std::sync::Arc;

use luft_dbus_macros::introspect;
use luft_identity::caller::refuse_sandboxed;
use tokio::sync::mpsc;
use zbus::message::Header;
use zbus::object_server::{InterfaceRef, SignalEmitter};
use zbus::{Connection, ObjectServer, fdo, interface};

use crate::app::App;
use crate::config::{Config, Visibility};
use crate::events::{Event, Offered, Peer};
use crate::localsend::send::What;

pub const NAME: &str = "com.lantharos.Kestrel.Post";
pub const PATH: &str = "/com/lantharos/Kestrel/Post";
const PINS: u32 = 1_000_000;
const EVENLY_SPREAD_BELOW: u32 = u32::MAX - u32::MAX % PINS;

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
    loop {
        let mut bytes = [0u8; 4];
        getrandom::fill(&mut bytes).expect("the system has randomness");
        let drawn = u32::from_ne_bytes(bytes);
        if drawn < EVENLY_SPREAD_BELOW {
            return format!("{:06}", drawn % PINS);
        }
    }
}

#[introspect]
#[interface(name = "com.lantharos.Kestrel.Post")]
impl Post {
    #[zbus(property)]
    fn alias(&self) -> String {
        self.alias.clone()
    }

    #[zbus(property)]
    fn folder(&self) -> String {
        self.folder.clone()
    }

    #[zbus(property)]
    fn devices(&self) -> Vec<Peer> {
        self.devices.clone()
    }

    #[zbus(property)]
    fn scanning(&self) -> bool {
        self.scanning
    }

    #[zbus(property)]
    fn listening(&self) -> bool {
        self.listening
    }

    async fn configure(&self, visibility: &str, name: &str, folder: &str, trusted: Vec<String>, #[zbus(header)] header: Header<'_>, #[zbus(connection)] bus: &Connection) -> fdo::Result<()> {
        refuse_sandboxed(bus, &header).await?;
        let visibility = Visibility::parse(visibility).ok_or_else(|| fdo::Error::InvalidArgs(format!("{visibility} isn't a visibility")))?;
        let folder = Some(folder).filter(|folder| !folder.is_empty()).map(PathBuf::from);
        self.app.configure(Config { visibility, alias: Some(name.to_owned()), folder, trusted });
        Ok(())
    }

    async fn scan(&self, #[zbus(header)] header: Header<'_>, #[zbus(connection)] bus: &Connection) -> fdo::Result<()> {
        refuse_sandboxed(bus, &header).await?;
        self.app.scans.notify_one();
        Ok(())
    }

    async fn send(&self, device: &str, paths: Vec<String>, #[zbus(header)] header: Header<'_>, #[zbus(connection)] bus: &Connection) -> fdo::Result<String> {
        refuse_sandboxed(bus, &header).await?;
        Ok(self.app.outbox.send(&self.app, device, What::Files(paths.into_iter().map(PathBuf::from).collect())))
    }

    async fn send_text(&self, device: &str, text: String, #[zbus(header)] header: Header<'_>, #[zbus(connection)] bus: &Connection) -> fdo::Result<String> {
        refuse_sandboxed(bus, &header).await?;
        Ok(self.app.outbox.send(&self.app, device, What::Text(text)))
    }

    async fn accept(&self, id: &str, #[zbus(header)] header: Header<'_>, #[zbus(connection)] bus: &Connection) -> fdo::Result<()> {
        refuse_sandboxed(bus, &header).await?;
        self.app.inbox.accept(id);
        Ok(())
    }

    async fn decline(&self, id: &str, #[zbus(header)] header: Header<'_>, #[zbus(connection)] bus: &Connection) -> fdo::Result<()> {
        refuse_sandboxed(bus, &header).await?;
        self.app.inbox.decline(id);
        Ok(())
    }

    async fn cancel(&self, id: &str, #[zbus(header)] header: Header<'_>, #[zbus(connection)] bus: &Connection) -> fdo::Result<()> {
        refuse_sandboxed(bus, &header).await?;
        self.app.inbox.cancel(&self.app, id);
        self.app.outbox.cancel(id);
        Ok(())
    }

    async fn answer_pin(&self, id: &str, pin: String, #[zbus(header)] header: Header<'_>, #[zbus(connection)] bus: &Connection) -> fdo::Result<()> {
        refuse_sandboxed(bus, &header).await?;
        self.app.outbox.pin(id, pin);
        Ok(())
    }

    async fn start_pairing(&self, #[zbus(header)] header: Header<'_>, #[zbus(connection)] bus: &Connection) -> fdo::Result<String> {
        refuse_sandboxed(bus, &header).await?;
        if self.app.visibility() == Visibility::NoOne {
            return Err(fdo::Error::Failed("No one can find this computer".into()));
        }
        let pin = new_pin();
        self.app.inbox.forget_attempts();
        self.app.start_pairing(pin.clone());
        self.app.scans.notify_one();
        Ok(pin)
    }

    async fn stop_pairing(&self, #[zbus(header)] header: Header<'_>, #[zbus(connection)] bus: &Connection) -> fdo::Result<()> {
        refuse_sandboxed(bus, &header).await?;
        self.app.stop_pairing();
        Ok(())
    }

    #[zbus(signal)]
    async fn offer(emitter: &SignalEmitter<'_>, id: &str, from: &Peer, files: &[Offered], size: u64) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn text(emitter: &SignalEmitter<'_>, from: &Peer, text: &str, trusted: bool) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn transfer(emitter: &SignalEmitter<'_>, id: &str, direction: &str, device: &str, stage: &str, progress: (u64, u64, u32)) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn finished(emitter: &SignalEmitter<'_>, id: &str, direction: &str, device: &str, outcome: &str, saved: &[String]) -> zbus::Result<()>;

    #[zbus(signal)]
    async fn paired(emitter: &SignalEmitter<'_>, device: &Peer) -> zbus::Result<()>;
}

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
