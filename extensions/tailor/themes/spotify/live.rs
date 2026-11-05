use std::io::{self, BufRead, BufReader, Write};
use std::net::{Ipv4Addr, TcpListener, TcpStream};
use std::sync::{Arc, Mutex, MutexGuard};
use std::thread;
use std::time::Duration;

use crate::look::Look;

pub const PORT: u16 = 47291;
const SPOTIFY_ORIGIN: &str = "https://xpui.app.spotify.com";
const PATIENCE: Duration = Duration::from_secs(1);

#[derive(Default)]
struct Listeners {
    latest: Option<String>,
    connected: Vec<TcpStream>,
}

/// Sends the desktop's look to Spotify's window as it changes, over server-sent events on the loopback address.
#[derive(Default)]
pub struct Stream(Mutex<Listeners>);

fn event(data: &str) -> String {
    format!("data: {data}\n\n")
}

fn from_spotify(connection: &TcpStream) -> io::Result<bool> {
    let mut from_spotify = false;
    for line in BufReader::new(connection).lines() {
        let line = line?;
        if line.is_empty() {
            return Ok(from_spotify);
        }
        if let Some((name, value)) = line.split_once(':') {
            from_spotify |= name.eq_ignore_ascii_case("origin") && value.trim() == SPOTIFY_ORIGIN;
        }
    }
    Ok(false)
}

fn accept_events(mut connection: &TcpStream) -> io::Result<()> {
    write!(
        connection,
        "HTTP/1.1 200 OK\r\nContent-Type: text/event-stream\r\nCache-Control: no-store\r\n\
         Access-Control-Allow-Origin: {SPOTIFY_ORIGIN}\r\n\r\n"
    )
}

impl Stream {
    fn listeners(&self) -> MutexGuard<'_, Listeners> {
        self.0
            .lock()
            .expect("no write panics while holding the lock")
    }

    fn welcome(&self, connection: TcpStream) -> io::Result<bool> {
        connection.set_read_timeout(Some(PATIENCE))?;
        connection.set_write_timeout(Some(PATIENCE))?;
        if !from_spotify(&connection)? {
            return Ok(false);
        }
        accept_events(&connection)?;
        let mut listeners = self.listeners();
        if let Some(latest) = &listeners.latest {
            (&connection).write_all(event(latest).as_bytes())?;
        }
        listeners.connected.push(connection);
        Ok(true)
    }

    pub fn listen(
        self: Arc<Self>,
        port: u16,
        connected: impl Fn() + Send + 'static,
    ) -> io::Result<()> {
        let listener = TcpListener::bind((Ipv4Addr::LOCALHOST, port))?;
        thread::spawn(move || {
            for connection in listener.incoming().flatten() {
                if self.welcome(connection).is_ok_and(|welcomed| welcomed) {
                    connected();
                }
            }
        });
        Ok(())
    }

    pub fn publish(&self, look: &Look) {
        let look = serde_json::to_string(look).expect("a look is always valid JSON");
        let message = event(&look);
        let mut listeners = self.listeners();
        listeners
            .connected
            .retain(|mut connection| connection.write_all(message.as_bytes()).is_ok());
        listeners.latest = Some(look);
    }

    pub fn has_listeners(&self) -> bool {
        !self.listeners().connected.is_empty()
    }

    /// Lets go of Spotify's window, which keeps the look it has until it restarts without the theme.
    pub fn close(&self) {
        self.listeners().connected.clear();
    }
}
