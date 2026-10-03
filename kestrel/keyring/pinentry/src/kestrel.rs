use std::collections::HashMap;
use std::io::{self, BufRead, BufReader, Write};
use std::sync::Arc;
use std::time::Duration;

use rustix::net::{AddressFamily, Shutdown, SocketFlags, SocketType};
use tokio::runtime::Runtime;
use zbus::Connection;
use zbus::zvariant::{Fd, OwnedValue, Value};
use zeroize::Zeroizing;

const NAME: &str = "com.lantharos.Kestrel";
const PATH: &str = "/com/lantharos/Kestrel/Pinentry";
const INTERFACE: &str = "com.lantharos.Kestrel.Pinentry";
const HANDLE: &str = "pinentry";

const CHOSEN: u32 = 0;
const REFUSED: u32 = 1;
const ALTERNATIVE: u32 = 3;

#[derive(Default)]
pub struct Request {
    pub texts: Vec<(&'static str, String)>,
    pub flags: Vec<&'static str>,
}

impl Request {
    pub fn text(&mut self, key: &'static str, value: &str) {
        if !value.is_empty() {
            self.texts.push((key, value.to_owned()));
        }
    }

    pub fn flag(&mut self, key: &'static str, value: bool) {
        if value {
            self.flags.push(key);
        }
    }

    fn options(&self) -> HashMap<&'static str, Value<'static>> {
        let texts = self
            .texts
            .iter()
            .map(|(key, value)| (*key, Value::from(value.clone())));
        let flags = self.flags.iter().map(|key| (*key, Value::from(true)));
        texts.chain(flags).collect()
    }
}

pub enum Entry {
    Entered {
        secret: Zeroizing<Vec<u8>>,
        remember: bool,
    },
    Cancelled,
    TimedOut,
}

pub enum Choice {
    Accepted,
    Declined,
    Alternative,
    TimedOut,
}

enum Reply<T> {
    Answered(T),
    Failed,
    TimedOut,
}

pub struct Kestrel {
    runtime: Runtime,
    connection: Connection,
}

impl Kestrel {
    pub fn connect() -> Option<Self> {
        let runtime = tokio::runtime::Builder::new_multi_thread()
            .worker_threads(1)
            .enable_all()
            .build()
            .ok()?;
        let connection = runtime.block_on(async {
            let connection = Connection::session().await.ok()?;
            let bus = zbus::fdo::DBusProxy::new(&connection).await.ok()?;
            let name = zbus::names::BusName::from_static_str(NAME).ok()?;
            bus.name_has_owner(name).await.ok()?.then_some(connection)
        })?;
        Some(Self {
            runtime,
            connection,
        })
    }

    pub fn block_on<F: Future>(&self, future: F) -> F::Output {
        self.runtime.block_on(future)
    }

    pub fn connection(&self) -> &Connection {
        &self.connection
    }

    pub fn password(
        &self,
        request: &Request,
        timeout: Option<Duration>,
        mut quality: impl FnMut(&[u8]) -> io::Result<i32>,
    ) -> io::Result<Entry> {
        let (ours, theirs) = rustix::net::socketpair(
            AddressFamily::UNIX,
            SocketType::STREAM,
            SocketFlags::CLOEXEC,
            None,
        )?;
        let ours = Arc::new(ours);
        let connection = self.connection.clone();
        let options = request.options();
        let reader_end = ours.clone();
        let call = self.runtime.spawn(async move {
            let reply = ask(&connection, timeout, async {
                connection
                    .call_method(
                        Some(NAME),
                        PATH,
                        Some(INTERFACE),
                        "Password",
                        &(HANDLE, options, Fd::from(&theirs)),
                    )
                    .await
                    .and_then(|reply| {
                        reply
                            .body()
                            .deserialize::<(u32, HashMap<String, OwnedValue>)>()
                    })
            })
            .await;
            drop(theirs);
            let _ = rustix::net::shutdown(&*reader_end, Shutdown::Read);
            reply
        });

        let mut channel = BufReader::new(std::fs::File::from(ours.try_clone()?));
        let mut secret = None;
        while let Some((kind, payload)) = read_frame(&mut channel)? {
            match kind {
                b'Q' => {
                    let score = quality(&payload)?;
                    channel
                        .get_mut()
                        .write_all(format!("{score}\n").as_bytes())?;
                }
                b'P' => secret = Some(payload),
                _ => {}
            }
        }

        Ok(
            match self.runtime.block_on(call).map_err(io::Error::other)? {
                Reply::Answered((CHOSEN, results)) => match secret {
                    Some(secret) => Entry::Entered {
                        secret,
                        remember: results
                            .get("remember")
                            .and_then(|value| bool::try_from(value).ok())
                            .unwrap_or(false),
                    },
                    None => Entry::Cancelled,
                },
                Reply::TimedOut => Entry::TimedOut,
                Reply::Answered(_) | Reply::Failed => Entry::Cancelled,
            },
        )
    }

    pub fn confirm(&self, request: &Request, timeout: Option<Duration>) -> Choice {
        let options = request.options();
        let reply = self.runtime.block_on(ask(&self.connection, timeout, async {
            self.connection
                .call_method(
                    Some(NAME),
                    PATH,
                    Some(INTERFACE),
                    "Confirm",
                    &(HANDLE, &options),
                )
                .await
                .and_then(|reply| reply.body().deserialize::<u32>())
        }));
        match reply {
            Reply::Answered(CHOSEN) => Choice::Accepted,
            Reply::Answered(ALTERNATIVE) => Choice::Alternative,
            Reply::Answered(REFUSED) | Reply::Answered(_) | Reply::Failed => Choice::Declined,
            Reply::TimedOut => Choice::TimedOut,
        }
    }

    pub fn close(&self) {
        let _ = self.runtime.block_on(close(&self.connection));
    }
}

async fn close(connection: &Connection) -> zbus::Result<zbus::Message> {
    connection
        .call_method(Some(NAME), PATH, Some(INTERFACE), "Close", &(HANDLE,))
        .await
}

async fn ask<T>(
    connection: &Connection,
    timeout: Option<Duration>,
    call: impl Future<Output = zbus::Result<T>>,
) -> Reply<T> {
    let answer = match timeout {
        Some(limit) => match tokio::time::timeout(limit, call).await {
            Ok(answer) => answer,
            Err(_) => {
                let _ = close(connection).await;
                return Reply::TimedOut;
            }
        },
        None => call.await,
    };
    answer.map_or_else(
        |error| {
            eprintln!("Kestrel couldn't ask: {error}");
            Reply::Failed
        },
        Reply::Answered,
    )
}

fn read_frame(channel: &mut impl BufRead) -> io::Result<Option<(u8, Zeroizing<Vec<u8>>)>> {
    let mut header = Vec::new();
    if channel.read_until(b'\n', &mut header)? == 0 || header.pop() != Some(b'\n') {
        return Ok(None);
    }
    let Some((&kind, length)) = header.split_first() else {
        return Ok(None);
    };
    let length: usize = std::str::from_utf8(length)
        .ok()
        .and_then(|length| length.parse().ok())
        .ok_or_else(|| {
            io::Error::new(
                io::ErrorKind::InvalidData,
                "Kestrel sent a frame without a length",
            )
        })?;
    let mut payload = Zeroizing::new(vec![0; length]);
    channel.read_exact(&mut payload)?;
    Ok(Some((kind, payload)))
}
