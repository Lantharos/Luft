use std::collections::HashMap;
use std::convert::Infallible;
use std::net::{Ipv4Addr, SocketAddr};
use std::sync::Arc;
use std::time::Duration;

use bytes::Bytes;
use http_body_util::{BodyExt, Full, Limited};
use hyper::body::Incoming;
use hyper::header::CONTENT_TYPE;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Method, Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use serde::Serialize;
use serde::de::DeserializeOwned;
use tokio::net::TcpListener;
use tokio::time::{sleep, timeout};
use tokio_rustls::TlsAcceptor;

use crate::app::App;
use crate::discovery::Device;
use crate::link::Event;
use crate::protocol::{API, PORT, Presence};
use crate::tls;

pub type Answer = Response<Full<Bytes>>;

const HANDSHAKE_WITHIN: Duration = Duration::from_secs(10);
const RETRY_AFTER: Duration = Duration::from_secs(10);
const REQUEST_LIMIT: usize = 16 << 20;

/// Who's on the other end of a request: where it came from, and the fingerprint its certificate proved, if it showed one.
#[derive(Clone, Debug)]
pub struct Caller {
    pub address: SocketAddr,
    pub fingerprint: Option<String>,
}

/// Serves LocalSend's API on port 53317, binding again while something else holds the port.
pub async fn run(app: Arc<App>) {
    let config = tls::server_config(&app.identity).expect("this computer's certificate works");
    let acceptor = TlsAcceptor::from(config);
    let mut reported = None;
    loop {
        match TcpListener::bind((Ipv4Addr::UNSPECIFIED, PORT)).await {
            Ok(listener) => {
                app.link.send(Event::Listening { listening: true });
                accept(&app, &acceptor, listener).await;
            }
            Err(error) => {
                if reported.replace(error.kind()) != Some(error.kind()) {
                    app.link.send(Event::Listening { listening: false });
                }
                sleep(RETRY_AFTER).await;
            }
        }
    }
}

async fn accept(app: &Arc<App>, acceptor: &TlsAcceptor, listener: TcpListener) {
    while let Ok((tcp, address)) = listener.accept().await {
        let _ = tcp.set_nodelay(true);
        let (app, acceptor) = (app.clone(), acceptor.clone());
        tokio::spawn(async move {
            let Ok(Ok(stream)) = timeout(HANDSHAKE_WITHIN, acceptor.accept(tcp)).await else {
                return;
            };
            let fingerprint = stream.get_ref().1.peer_certificates().and_then(|chain| chain.first()).map(|cert| tls::fingerprint(cert));
            let caller = Caller { address, fingerprint };
            let service = service_fn(move |request| {
                let (app, caller) = (app.clone(), caller.clone());
                async move { Ok::<_, Infallible>(route(&app, &caller, request).await) }
            });
            let _ = http1::Builder::new().serve_connection(TokioIo::new(stream), service).await;
        });
    }
}

async fn route(app: &Arc<App>, caller: &Caller, request: Request<Incoming>) -> Answer {
    let Some(route) = request.uri().path().strip_prefix(API).and_then(|path| path.strip_prefix('/')) else {
        return status(StatusCode::NOT_FOUND);
    };
    let query = query(request.uri().query());
    match (request.method(), route) {
        (&Method::GET | &Method::POST, "info") => json(&app.info()),
        (&Method::POST, "register") => register(app, caller, request).await,
        (&Method::POST, "prepare-upload") => crate::receive::prepare(app, caller, &query, request).await,
        (&Method::POST, "upload") => crate::receive::upload(app, caller, &query, request).await,
        (&Method::POST, "cancel") => cancel(app, caller, &query),
        _ => status(StatusCode::NOT_FOUND),
    }
}

/// Another device answers an announcement, or looks for this computer: it shows up among the devices.
async fn register(app: &App, caller: &Caller, request: Request<Incoming>) -> Answer {
    let Ok(presence) = read::<Presence>(request).await else {
        return status(StatusCode::BAD_REQUEST);
    };
    let claimed = presence.info.fingerprint.to_ascii_uppercase();
    let proven = caller.fingerprint.as_ref().is_some_and(|fingerprint| *fingerprint == claimed);
    if caller.fingerprint.is_none() || proven {
        let address = SocketAddr::new(caller.address.ip(), presence.port);
        app.devices.heard(Device::new(&presence, claimed, address, proven));
    }
    json(&app.info())
}

fn cancel(app: &App, caller: &Caller, query: &HashMap<String, String>) -> Answer {
    let Some(session) = query.get("sessionId") else {
        return status(StatusCode::BAD_REQUEST);
    };
    if !app.inbox.cancel_from(app, caller.address.ip(), session) {
        app.outbox.cancel_from(caller.address.ip(), session);
    }
    status(StatusCode::OK)
}

pub async fn read<T: DeserializeOwned>(request: Request<Incoming>) -> Result<T, ()> {
    let body = Limited::new(request.into_body(), REQUEST_LIMIT).collect().await.map_err(drop)?;
    serde_json::from_slice(&body.to_bytes()).map_err(drop)
}

pub fn status(status: StatusCode) -> Answer {
    let mut answer = Response::new(Full::default());
    *answer.status_mut() = status;
    answer
}

pub fn json(value: &impl Serialize) -> Answer {
    let mut answer = Response::new(Full::new(Bytes::from(serde_json::to_vec(value).expect("answers serialize"))));
    answer.headers_mut().insert(CONTENT_TYPE, "application/json".parse().expect("a valid header"));
    answer
}

fn query(query: Option<&str>) -> HashMap<String, String> {
    url::form_urlencoded::parse(query.unwrap_or_default().as_bytes()).into_owned().collect()
}
