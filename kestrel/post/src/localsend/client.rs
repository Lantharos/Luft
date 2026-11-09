use std::io;
use std::net::SocketAddr;
use std::time::Duration;

use bytes::Bytes;
use http_body_util::combinators::BoxBody;
use http_body_util::{BodyExt, Full, Limited};
use hyper::client::conn::http1::{self, SendRequest};
use hyper::header::{CONTENT_LENGTH, CONTENT_TYPE, HOST};
use hyper::{Method, Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use rustls::pki_types::ServerName;
use serde::Serialize;
use serde::de::DeserializeOwned;
use tokio::io::{AsyncRead, AsyncWrite};
use tokio::net::TcpStream;
use tokio::time::timeout;
use tokio_rustls::TlsConnector;

use crate::localsend::protocol::{API, Scheme};
use crate::localsend::tls::{self, Identity};

pub type Body = BoxBody<Bytes, io::Error>;

const ANSWER_LIMIT: usize = 1 << 20;

/// Where a device's server is, and the fingerprint its certificate must have, when it's known.
#[derive(Clone, Debug)]
pub struct Target<'a> {
    pub address: SocketAddr,
    pub scheme: Scheme,
    pub fingerprint: Option<&'a str>,
}

/// A connection to a device, with the fingerprint its certificate showed.
pub struct Connection {
    sender: SendRequest<Body>,
    host: String,
    pub fingerprint: Option<String>,
}

trait Stream: AsyncRead + AsyncWrite + Unpin + Send {}
impl<T: AsyncRead + AsyncWrite + Unpin + Send> Stream for T {}

pub async fn connect(identity: &Identity, target: &Target<'_>, wait: Duration) -> io::Result<Connection> {
    let tcp = timeout(wait, TcpStream::connect(target.address)).await.map_err(|_| io::ErrorKind::TimedOut)??;
    tcp.set_nodelay(true)?;
    let (stream, fingerprint): (Box<dyn Stream>, _) = match target.scheme {
        Scheme::Http => (Box::new(tcp), None),
        Scheme::Https => {
            let config = tls::client_config(identity, target.fingerprint).map_err(io::Error::other)?;
            let name = ServerName::IpAddress(target.address.ip().into());
            let handshake = TlsConnector::from(config).connect(name, tcp);
            let tls = timeout(wait, handshake).await.map_err(|_| io::ErrorKind::TimedOut)??;
            let seen = tls.get_ref().1.peer_certificates().and_then(|chain| chain.first()).map(|cert| tls::fingerprint(cert));
            (Box::new(tls), seen)
        }
    };
    let (sender, connection) = http1::handshake(TokioIo::new(stream)).await.map_err(io::Error::other)?;
    tokio::spawn(connection);
    Ok(Connection { sender, host: target.address.to_string(), fingerprint })
}

impl Connection {
    pub async fn send(&mut self, method: Method, route: &str, body: Body, length: Option<u64>) -> io::Result<Response<hyper::body::Incoming>> {
        let mut request = Request::builder().method(method).uri(format!("{API}/{route}")).header(HOST, &self.host);
        if let Some(length) = length {
            request = request.header(CONTENT_LENGTH, length).header(CONTENT_TYPE, "application/octet-stream");
        }
        let request = request.body(body).map_err(io::Error::other)?;
        self.sender.send_request(request).await.map_err(io::Error::other)
    }

    pub async fn post_json(&mut self, route: &str, value: &impl Serialize) -> io::Result<Response<hyper::body::Incoming>> {
        let body = serde_json::to_vec(value).map_err(io::Error::other)?;
        let length = body.len() as u64;
        let request = Request::builder()
            .method(Method::POST)
            .uri(format!("{API}/{route}"))
            .header(HOST, &self.host)
            .header(CONTENT_TYPE, "application/json")
            .header(CONTENT_LENGTH, length)
            .body(full(body))
            .map_err(io::Error::other)?;
        self.sender.send_request(request).await.map_err(io::Error::other)
    }
}

pub fn full(bytes: impl Into<Bytes>) -> Body {
    Full::new(bytes.into()).map_err(|never| match never {}).boxed()
}

pub fn empty() -> Body {
    full(Bytes::new())
}

/// Reads an answer as JSON, refusing one that's unreasonably large.
pub async fn json<T: DeserializeOwned>(response: Response<hyper::body::Incoming>) -> io::Result<T> {
    let body = Limited::new(response.into_body(), ANSWER_LIMIT).collect().await.map_err(io::Error::other)?;
    serde_json::from_slice(&body.to_bytes()).map_err(io::Error::other)
}

pub fn failed(status: StatusCode) -> io::Error {
    io::Error::other(format!("the device answered {status}"))
}
