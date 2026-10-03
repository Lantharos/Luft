mod forms;
mod kestrel;
mod library;

use std::collections::HashMap;
use std::ffi::{c_char, c_int, c_void};
use std::io::{self, BufReader, Stdin, Stdout};
use std::process::ExitCode;

use kestrel::{Answer, Connection, Kestrel, Message};
use library::{AuthForm, Callbacks, Info, OpenConnect, PROGRESS_ERROR, text};

const USER_AGENT: &str = "OpenConnect VPN Agent (NetworkManager)";
const SIGNED_IN: c_int = 0;

type Channel = Kestrel<BufReader<Stdin>, Stdout>;

pub struct Session {
    kestrel: Channel,
    secrets: HashMap<String, String>,
    library: Option<OpenConnect>,
    remembered: HashMap<String, String>,
}

impl Session {
    fn library(&self) -> &OpenConnect {
        self.library
            .as_ref()
            .expect("OpenConnect is loaded before it calls back")
    }
}

unsafe extern "C" {
    fn kestrel_openconnect_progress(session: *mut c_void, level: c_int, format: *const c_char, ...);
}

#[unsafe(no_mangle)]
extern "C" fn kestrel_openconnect_report(_session: *mut c_void, level: c_int, line: *const c_char) {
    if level == PROGRESS_ERROR
        && let Some(line) = text(line)
    {
        eprint!("{line}");
    }
}

unsafe fn session<'a>(pointer: *mut c_void) -> &'a mut Session {
    unsafe { &mut *pointer.cast::<Session>() }
}

unsafe extern "C" fn validate(pointer: *mut c_void, reason: *const c_char) -> c_int {
    let session = unsafe { session(pointer) };
    let library = session.library();
    let host = format!(
        "{}:{}",
        library.hostname().unwrap_or_default(),
        library.port()
    );
    let key = format!("certificate:{host}");
    let fingerprint = library.certificate_hash().unwrap_or_default();
    if session
        .secrets
        .get(&key)
        .or_else(|| session.remembered.get(&key))
        .is_some_and(|accepted| library.certificate_matches(accepted))
    {
        return 0;
    }
    let reason = text(reason).unwrap_or_default();
    match session.kestrel.ask(&Message::Certificate {
        host: &host,
        reason: &reason,
        fingerprint: &fingerprint,
    }) {
        Some(Answer::Accept { accept: true }) => {
            session.remembered.insert(key, fingerprint);
            0
        }
        _ => 1,
    }
}

unsafe extern "C" fn keep_config(_: *mut c_void, _: *const c_char, _: c_int) -> c_int {
    0
}

unsafe extern "C" fn process_form(pointer: *mut c_void, form: *mut AuthForm) -> c_int {
    let session = unsafe { session(pointer) };
    unsafe { forms::fill(session, &mut *form) }
}

unsafe extern "C" fn browse(_: *mut Info, uri: *const c_char, pointer: *mut c_void) -> c_int {
    let session = unsafe { session(pointer) };
    let uri = text(uri).unwrap_or_default();
    session
        .kestrel
        .send(&Message::Browse { uri: &uri })
        .map_or(-1, |()| 0)
}

fn configure(library: &OpenConnect, data: &HashMap<String, String>) -> Result<(), String> {
    let value = |key: &str| {
        data.get(key)
            .map(String::as_str)
            .filter(|value| !value.is_empty())
    };
    if let Some(protocol) = value("protocol")
        && !library.set_protocol(protocol)
    {
        return Err(format!("OpenConnect doesn't know the {protocol} protocol"));
    }
    let gateway = value("gateway").ok_or("The VPN has no server")?;
    let gateway = gateway.lines().next().unwrap_or(gateway);
    if !library.parse_url(gateway) {
        return Err(format!("{gateway} isn't a server address"));
    }
    if let Some(certificate) = value("usercert") {
        library.set_client_certificate(certificate, value("userkey"));
    }
    if let Some(file) = value("cacert") {
        library.set_ca_file(file);
    }
    if let Some(proxy) = value("proxy") {
        library.set_proxy(proxy);
    }
    if let Some(os) = value("reported_os") {
        library.set_reported_os(os);
    }
    if value("enable_csd_trojan") == Some("yes") {
        library.setup_trojan(value("csd_wrapper"));
    }
    Ok(())
}

fn signed_in(session: &Session) -> HashMap<String, String> {
    let library = session.library();
    let mut secrets = session.remembered.clone();
    secrets.extend([
        (
            "gateway".to_owned(),
            library.connect_url().unwrap_or_default(),
        ),
        ("cookie".to_owned(), library.cookie().unwrap_or_default()),
    ]);
    if let Some(hash) = library.certificate_hash() {
        secrets.insert("gwcert".to_owned(), hash);
    }
    if let (Some(address), Some(name)) = (library.hostname(), library.dns_name())
        && address != name
    {
        let address = address.trim_start_matches('[').trim_end_matches(']');
        secrets.insert("resolve".to_owned(), format!("{name}:{address}"));
    }
    secrets
}

fn run(
    session: &mut Session,
    data: &HashMap<String, String>,
) -> Result<Option<HashMap<String, String>>, String> {
    let callbacks = Callbacks {
        validate,
        write_config: keep_config,
        process_form,
        progress: kestrel_openconnect_progress,
        browse,
    };
    let user_agent = data
        .get("useragent")
        .filter(|agent| !agent.is_empty())
        .map_or(USER_AGENT, String::as_str);
    let pointer = std::ptr::from_mut(session).cast::<c_void>();
    session.library = Some(OpenConnect::load(user_agent, &callbacks, pointer)?);
    configure(session.library(), data)?;
    match session.library().obtain_cookie() {
        SIGNED_IN => Ok(Some(signed_in(session))),
        result if result > 0 => Ok(None),
        _ => Err("Signing in to the VPN didn’t work".to_owned()),
    }
}

fn main() -> ExitCode {
    let mut kestrel = Kestrel::new(BufReader::new(io::stdin()), io::stdout());
    let Some(Connection { data, secrets }) = kestrel.connection() else {
        eprintln!("Kestrel didn't describe the VPN");
        return ExitCode::FAILURE;
    };
    let mut session = Session {
        kestrel,
        secrets,
        library: None,
        remembered: HashMap::new(),
    };
    let outcome = run(&mut session, &data);
    session.library = None;
    let sent = match &outcome {
        Ok(Some(secrets)) => session.kestrel.send(&Message::Done { secrets }),
        Ok(None) => return ExitCode::SUCCESS,
        Err(message) => session.kestrel.send(&Message::Failed { message }),
    };
    if sent.is_err() || outcome.is_err() {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}
