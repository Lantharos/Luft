use std::error::Error;
use std::io::{self, Read};
use std::os::fd::{AsRawFd, RawFd};
use std::os::unix::net::UnixStream;
use std::path::Path;

use tokio::io::unix::AsyncFd;
use tokio::sync::watch;
use x11rb::connection::Connection;
use x11rb::protocol::Event;
use x11rb::protocol::xproto::{
    AtomEnum, ClientMessageEvent, ConnectionExt, CreateWindowAux, EventMask, PropMode, Window,
    WindowClass,
};
use x11rb::reexports::x11rb_protocol::parse_display::parse_display;
use x11rb::rust_connection::{DefaultStream, RustConnection};
use x11rb::wrapper::ConnectionExt as _;
use x11rb::{COPY_DEPTH_FROM_PARENT, COPY_FROM_PARENT, NONE};

use super::snapshot::Snapshot;
use super::wire::Table;

const COOKIE_NAME: &[u8] = b"MIT-MAGIC-COOKIE-1";

type Failure = Box<dyn Error + Send + Sync>;

pub struct Display {
    readable: AsyncFd<RawFd>,
    connection: RustConnection,
    root: Window,
    window: Window,
    selection: u32,
    settings_atom: u32,
    table: Table,
    resources: Vec<(&'static str, String)>,
}

impl Display {
    pub fn connect(name: &str, authority: &Path) -> Result<Self, Failure> {
        let (stream, screen) = open_stream(name)?;
        let cookie = read_cookie(authority)?;
        let connection = RustConnection::connect_to_stream_with_auth_info(
            stream,
            screen,
            COOKIE_NAME.to_vec(),
            cookie,
        )?;
        let root = connection.setup().roots[screen].root;
        let selection = intern(&connection, &format!("_XSETTINGS_S{screen}"))?;
        let settings_atom = intern(&connection, "_XSETTINGS_SETTINGS")?;
        let manager = intern(&connection, "MANAGER")?;
        if connection.get_selection_owner(selection)?.reply()?.owner != NONE {
            return Err("Another settings manager already serves this X display".into());
        }
        let window = connection.generate_id()?;
        connection.create_window(
            COPY_DEPTH_FROM_PARENT,
            window,
            root,
            -1,
            -1,
            1,
            1,
            0,
            WindowClass::INPUT_ONLY,
            COPY_FROM_PARENT,
            &CreateWindowAux::new()
                .override_redirect(1)
                .event_mask(EventMask::PROPERTY_CHANGE),
        )?;
        let time = server_time(&connection, window, settings_atom)?;
        connection.set_selection_owner(window, selection, time)?;
        if connection.get_selection_owner(selection)?.reply()?.owner != window {
            return Err("Couldn't become the settings manager of this X display".into());
        }
        let announcement =
            ClientMessageEvent::new(32, root, manager, [time, selection, window, 0, 0]);
        connection.send_event(false, root, EventMask::STRUCTURE_NOTIFY, announcement)?;
        connection.flush()?;
        Ok(Self {
            readable: AsyncFd::new(connection.stream().as_raw_fd())?,
            connection,
            root,
            window,
            selection,
            settings_atom,
            table: Table::default(),
            resources: Vec::new(),
        })
    }

    pub fn merge_resources(&self, resources: &[(String, String)]) -> Result<(), Failure> {
        self.write_resources(resources)
    }

    pub fn apply(&mut self, snapshot: &Snapshot) -> Result<(), Failure> {
        if self.table.update(&snapshot.values) {
            let encoded = self.table.encode();
            self.connection.change_property8(
                PropMode::REPLACE,
                self.window,
                self.settings_atom,
                self.settings_atom,
                &encoded,
            )?;
        }
        if self.resources != snapshot.resources {
            self.write_resources(&snapshot.resources)?;
            self.resources = snapshot.resources.clone();
        }
        self.connection.flush()?;
        Ok(())
    }

    fn write_resources(&self, resources: &[(impl AsRef<str>, String)]) -> Result<(), Failure> {
        let current = self
            .connection
            .get_property(
                false,
                self.root,
                AtomEnum::RESOURCE_MANAGER,
                AtomEnum::STRING,
                0,
                u32::MAX / 4,
            )?
            .reply()?;
        let mut lines: Vec<String> = String::from_utf8_lossy(&current.value)
            .lines()
            .filter(|line| {
                let key = line.split(':').next().unwrap_or_default();
                !resources.iter().any(|(name, _)| name.as_ref() == key)
            })
            .map(str::to_owned)
            .collect();
        lines.extend(
            resources
                .iter()
                .map(|(name, value)| format!("{}:\t{value}", name.as_ref())),
        );
        let text = lines.join("\n") + "\n";
        self.connection.change_property8(
            PropMode::REPLACE,
            self.root,
            AtomEnum::RESOURCE_MANAGER,
            AtomEnum::STRING,
            text.as_bytes(),
        )?;
        Ok(())
    }

    pub async fn serve(mut self, mut snapshots: watch::Receiver<Snapshot>) {
        loop {
            match self.pending_events() {
                Ok(true) => {}
                Ok(false) => return,
                Err(error) => {
                    eprintln!("Lost the X display: {error}");
                    return;
                }
            }
            tokio::select! {
                changed = snapshots.changed() => {
                    if changed.is_err() {
                        return;
                    }
                    let snapshot = snapshots.borrow_and_update().clone();
                    if let Err(error) = self.apply(&snapshot) {
                        eprintln!("Couldn't update settings for X11 apps: {error}");
                        return;
                    }
                }
                ready = self.readable.readable() => {
                    let Ok(mut ready) = ready else { return };
                    ready.clear_ready();
                }
            }
        }
    }

    fn pending_events(&self) -> Result<bool, Failure> {
        while let Some(event) = self.connection.poll_for_event()? {
            if let Event::SelectionClear(clear) = event
                && clear.selection == self.selection
            {
                eprintln!("Another settings manager took over the X display");
                return Ok(false);
            }
        }
        Ok(true)
    }
}

fn open_stream(name: &str) -> Result<(DefaultStream, usize), Failure> {
    if let Some(path) = name
        .strip_prefix("unix:")
        .filter(|path| path.starts_with('/'))
    {
        return Ok((
            DefaultStream::from_unix_stream(UnixStream::connect(path)?)?.0,
            0,
        ));
    }
    let parsed = parse_display(Some(name))?;
    let stream = parsed
        .connect_instruction()
        .find_map(|address| DefaultStream::connect(&address).ok())
        .ok_or_else(|| format!("Couldn't reach the X server at {name}"))?;
    Ok((stream.0, usize::from(parsed.screen)))
}

fn intern(connection: &RustConnection, name: &str) -> Result<u32, Failure> {
    Ok(connection
        .intern_atom(false, name.as_bytes())?
        .reply()?
        .atom)
}

fn server_time(connection: &RustConnection, window: Window, atom: u32) -> Result<u32, Failure> {
    connection.change_property8(PropMode::APPEND, window, atom, atom, &[])?;
    connection.flush()?;
    loop {
        if let Event::PropertyNotify(notify) = connection.wait_for_event()?
            && notify.window == window
        {
            return Ok(notify.time);
        }
    }
}

fn read_cookie(path: &Path) -> io::Result<Vec<u8>> {
    let mut file = std::fs::File::open(path)?;
    loop {
        let mut family = [0; 2];
        file.read_exact(&mut family)?;
        let _address = read_field(&mut file)?;
        let _number = read_field(&mut file)?;
        let name = read_field(&mut file)?;
        let data = read_field(&mut file)?;
        if name == COOKIE_NAME {
            return Ok(data);
        }
    }
}

fn read_field(file: &mut impl Read) -> io::Result<Vec<u8>> {
    let mut length = [0; 2];
    file.read_exact(&mut length)?;
    let mut field = vec![0; usize::from(u16::from_be_bytes(length))];
    file.read_exact(&mut field)?;
    Ok(field)
}
