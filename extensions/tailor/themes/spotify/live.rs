use std::io::{self, Read, Write};
use std::net::{Ipv4Addr, TcpListener, TcpStream};
use std::sync::{Arc, Mutex, MutexGuard};
use std::thread;
use std::time::{Duration, Instant};

use crate::look::Look;

pub const PORT: u16 = 47291;
const SPOTIFY_ORIGIN: &str = "https://xpui.app.spotify.com";
const PATIENCE: Duration = Duration::from_secs(1);
const MAX_REQUEST: usize = 8 * 1024;

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

fn ended(request: &[u8]) -> bool {
    request.windows(4).any(|end| end == b"\r\n\r\n") || request.windows(2).any(|end| end == b"\n\n")
}

fn headers(mut connection: &TcpStream) -> io::Result<String> {
    let deadline = Instant::now() + PATIENCE;
    let mut request = Vec::new();
    let mut chunk = [0; 1024];
    while !ended(&request) {
        let left = deadline.saturating_duration_since(Instant::now());
        if left.is_zero() {
            return Err(io::ErrorKind::TimedOut.into());
        }
        connection.set_read_timeout(Some(left))?;
        let read = connection.read(&mut chunk)?;
        if read == 0 || request.len() + read > MAX_REQUEST {
            return Err(io::ErrorKind::InvalidData.into());
        }
        request.extend_from_slice(&chunk[..read]);
    }
    String::from_utf8(request).map_err(|_| io::ErrorKind::InvalidData.into())
}

fn from_spotify(headers: &str) -> bool {
    headers
        .lines()
        .take_while(|line| !line.is_empty())
        .filter_map(|line| line.split_once(':'))
        .any(|(name, value)| name.eq_ignore_ascii_case("origin") && value.trim() == SPOTIFY_ORIGIN)
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
        connection.set_write_timeout(Some(PATIENCE))?;
        if !from_spotify(&headers(&connection)?) {
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
