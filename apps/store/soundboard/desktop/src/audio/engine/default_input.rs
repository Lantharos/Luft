use std::ffi::CString;
use std::io::BufReader;
use std::os::unix::net::UnixStream;

use luft_i18n::t;
use pulseaudio::protocol::{self, AuthParams, AuthReply, Command, Prop, Props, SetClientNameReply};

use crate::L10N;

const COOKIE_LENGTH: usize = 256;

fn cookie() -> Vec<u8> {
    let mut cookie = pulseaudio::cookie_path_from_env()
        .and_then(|path| std::fs::read(path).ok())
        .unwrap_or_default();
    cookie.resize(COOKIE_LENGTH, 0);
    cookie
}

pub fn use_as_default(name: &str) -> Result<(), String> {
    let failed = |error: &dyn std::fmt::Display| error.to_string();
    let socket =
        pulseaudio::socket_path_from_env().ok_or_else(|| t!(L10N, "error-no-sound-server"))?;
    let mut server = BufReader::new(UnixStream::connect(socket).map_err(|e| failed(&e))?);
    let auth = AuthParams {
        version: protocol::MAX_VERSION,
        supports_shm: false,
        supports_memfd: false,
        cookie: cookie(),
    };
    protocol::write_command_message(
        server.get_mut(),
        0,
        &Command::Auth(auth),
        protocol::MAX_VERSION,
    )
    .map_err(|e| failed(&e))?;
    let (_, reply) = protocol::read_reply_message::<AuthReply>(&mut server, protocol::MAX_VERSION)
        .map_err(|e| failed(&e))?;
    let version = protocol::MAX_VERSION.min(reply.version);
    let mut props = Props::new();
    props.set(
        Prop::ApplicationName,
        CString::new("Soundboard").map_err(|e| failed(&e))?,
    );
    protocol::write_command_message(server.get_mut(), 1, &Command::SetClientName(props), version)
        .map_err(|e| failed(&e))?;
    protocol::read_reply_message::<SetClientNameReply>(&mut server, version)
        .map_err(|e| failed(&e))?;
    let target = CString::new(name).map_err(|e| failed(&e))?;
    protocol::write_command_message(
        server.get_mut(),
        2,
        &Command::SetDefaultSource(target),
        version,
    )
    .map_err(|e| failed(&e))?;
    protocol::read_ack_message(&mut server)
        .map(drop)
        .map_err(|e| failed(&e))
}
