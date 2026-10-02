use std::io::{Read, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::sync::{Arc, OnceLock};
use std::time::Duration;

use rustls::pki_types::ServerName;
use rustls::{ClientConfig, ClientConnection, StreamOwned};
use rustls_platform_verifier::ConfigVerifierExt;
use serde::{Deserialize, Serialize};

const CONNECT_TIMEOUT: Duration = Duration::from_secs(15);

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Security {
    Tls,
    StartTls,
    None,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Server {
    pub host: String,
    pub port: u16,
    pub security: Security,
}

pub fn tls() -> Arc<ClientConfig> {
    static CONFIG: OnceLock<Arc<ClientConfig>> = OnceLock::new();
    CONFIG
        .get_or_init(|| {
            Arc::new(
                ClientConfig::with_platform_verifier()
                    .expect("the system's certificate store is readable"),
            )
        })
        .clone()
}

pub enum Stream {
    Plain(TcpStream),
    Tls(Box<StreamOwned<ClientConnection, TcpStream>>),
}

impl Stream {
    pub fn connect(server: &Server) -> Result<Self, String> {
        let address = (server.host.as_str(), server.port)
            .to_socket_addrs()
            .map_err(|error| format!("{} can't be found: {error}", server.host))?
            .next()
            .ok_or_else(|| format!("{} can't be found", server.host))?;
        let socket = TcpStream::connect_timeout(&address, CONNECT_TIMEOUT)
            .map_err(|error| format!("{} isn't reachable: {error}", server.host))?;
        socket.set_nodelay(true).ok();
        match server.security {
            Security::Tls => Self::Plain(socket).secure(&server.host),
            _ => Ok(Self::Plain(socket)),
        }
    }

    pub fn secure(self, host: &str) -> Result<Self, String> {
        let Self::Plain(socket) = self else {
            return Ok(self);
        };
        let name = ServerName::try_from(host.to_owned()).map_err(|error| error.to_string())?;
        let connection = ClientConnection::new(tls(), name).map_err(|error| error.to_string())?;
        Ok(Self::Tls(Box::new(StreamOwned::new(connection, socket))))
    }

    fn socket(&self) -> &TcpStream {
        match self {
            Self::Plain(socket) => socket,
            Self::Tls(stream) => stream.get_ref(),
        }
    }

    pub fn set_timeout(&self, timeout: Option<Duration>) {
        self.socket().set_read_timeout(timeout).ok();
        self.socket().set_write_timeout(timeout).ok();
    }
}

impl Read for Stream {
    fn read(&mut self, buffer: &mut [u8]) -> std::io::Result<usize> {
        match self {
            Self::Plain(socket) => socket.read(buffer),
            Self::Tls(stream) => stream.read(buffer),
        }
    }
}

impl Write for Stream {
    fn write(&mut self, buffer: &[u8]) -> std::io::Result<usize> {
        match self {
            Self::Plain(socket) => socket.write(buffer),
            Self::Tls(stream) => stream.write(buffer),
        }
    }

    fn flush(&mut self) -> std::io::Result<()> {
        match self {
            Self::Plain(socket) => socket.flush(),
            Self::Tls(stream) => stream.flush(),
        }
    }
}
