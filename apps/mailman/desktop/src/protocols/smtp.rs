use std::time::Duration;

use lettre::Transport;
use lettre::address::Envelope;
use lettre::transport::smtp::SmtpTransport;
use lettre::transport::smtp::authentication::{Credentials, Mechanism};
use lettre::transport::smtp::client::{Tls, TlsParameters};

use crate::accounts::Login;
use crate::protocols::net::{Security, Server};
use crate::store::Outgoing;

const TIMEOUT: Duration = Duration::from_secs(60);

pub fn send(server: &Server, login: &Login, outgoing: &Outgoing) -> Result<(), String> {
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
    let envelope = Envelope::new(Some(sender), recipients).map_err(|error| error.to_string())?;
    transport
        .send_raw(&envelope, &outgoing.raw)
        .map(drop)
        .map_err(|error| format!("Sending failed: {error}"))
}
