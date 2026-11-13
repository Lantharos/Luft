use std::error::Error as _;
use std::time::Duration;

use lettre::Transport;
use lettre::address::Envelope;
use lettre::transport::smtp::authentication::{Credentials, Mechanism};
use lettre::transport::smtp::client::{Tls, TlsParameters};
use lettre::transport::smtp::response::{Category, Code, Severity};
use lettre::transport::smtp::{Error, SmtpTransport};

use crate::accounts::Login;
use crate::protocols::net::{Security, Server};
use crate::store::{Delivery, Outgoing};

const TIMEOUT: Duration = Duration::from_secs(60);

pub fn send(server: &Server, login: &Login, outgoing: &Outgoing) -> Result<Delivery, String> {
    let parameters = || TlsParameters::new(server.host.clone()).map_err(|error| error.to_string());
    let tls = match server.security {
        Security::Tls => Tls::Wrapper(parameters()?),
        Security::StartTls => Tls::Required(parameters()?),
        Security::None => Tls::None,
    };
    let (credentials, mechanisms) = match login {
        Login::Password { username, password } => (
            Credentials::new(username.clone(), password.clone()),
            vec![Mechanism::Plain, Mechanism::Login],
        ),
        Login::Bearer {
            username, token, ..
        } => (
            Credentials::new(username.clone(), token.clone()),
            vec![Mechanism::Xoauth2],
        ),
    };
    let transport = SmtpTransport::builder_dangerous(&server.host)
        .port(server.port)
        .tls(tls)
        .credentials(credentials)
        .authentication(mechanisms)
        .timeout(Some(TIMEOUT))
        .build();
    let envelope = match envelope(outgoing) {
        Ok(envelope) => envelope,
        Err(reason) => return Ok(Delivery::Refused(reason)),
    };
    match transport.send_raw(&envelope, &outgoing.raw) {
        Ok(_) => Ok(Delivery::Sent),
        Err(error) if refused_for_good(&error) => Ok(Delivery::Refused(reply(&error))),
        Err(error) => Err(reply(&error)),
    }
}

fn envelope(outgoing: &Outgoing) -> Result<Envelope, String> {
    let sender = outgoing
        .sender
        .parse()
        .map_err(|_| format!("{} isn't a valid address", outgoing.sender))?;
    let recipients = outgoing
        .recipients
        .iter()
        .map(|recipient| {
            recipient
                .parse()
                .map_err(|_| format!("{recipient} isn't a valid address"))
        })
        .collect::<Result<Vec<_>, String>>()?;
    Envelope::new(Some(sender), recipients).map_err(|error| error.to_string())
}

fn refused_for_good(error: &Error) -> bool {
    error.status().is_some_and(|code| {
        code.severity == Severity::PermanentNegativeCompletion && !about_signing_in(code)
    })
}

fn about_signing_in(code: Code) -> bool {
    code.category == Category::Unspecified3
}

fn reply(error: &Error) -> String {
    match (error.status(), error.source()) {
        (Some(code), Some(message)) => format!("{code} {message}"),
        _ => error.to_string(),
    }
}
