mod bus;
mod bytes;
mod card;
mod fido;
mod keyring;
mod recovery;
mod sessions;
mod store;
mod usb;
mod verify;
mod ways;

use std::os::fd::FromRawFd;
use std::sync::Arc;
use std::time::Duration;

use anyhow::{Context, bail};
use luft_dbus::idle::Idle;
use tokio::net::UnixListener;

use bus::{NAME, PATH, SignIn};
use verify::Verifier;

const IDLE_TIMEOUT: Duration = Duration::from_secs(60);
const LISTEN_FD: i32 = 3;
const ALLOW_PASSWORD: &str = "allow-password";

fn main() -> anyhow::Result<()> {
    luft_dbus::panics::report();
    let mut arguments = std::env::args().skip(1);
    match arguments.next().as_deref() {
        None => serve(),
        Some(ALLOW_PASSWORD) => {
            let user = arguments
                .next()
                .context("Name the account to sign in with its password again")?;
            let uid =
                ways::uid_of(&user).with_context(|| format!("There's no account called {user}"))?;
            store::Store::system().change(uid, |person| person.password = true)?;
            println!("{user} can sign in with their password again.");
            Ok(())
        }
        Some(argument) => bail!("Unknown argument {argument}"),
    }
}

fn activated_listener() -> Option<std::os::unix::net::UnixListener> {
    let pid = std::env::var("LISTEN_PID").ok()?.parse::<u32>().ok()?;
    let count = std::env::var("LISTEN_FDS").ok()?.parse::<i32>().ok()?;
    (pid == std::process::id() && count == 1)
        .then(|| unsafe { std::os::unix::net::UnixListener::from_raw_fd(LISTEN_FD) })
}

#[tokio::main]
async fn serve() -> anyhow::Result<()> {
    let idle = Arc::new(Idle::default());
    let connection = zbus::connection::Builder::system()
        .serve_at(PATH, SignIn::new(idle.clone()))
        .name(NAME)
        .build()
        .await?;
    let verifier = Arc::new(Verifier {
        connection: connection.clone(),
        idle: idle.clone(),
        watches: Arc::default(),
    });
    let listening = async {
        match activated_listener() {
            Some(listener) => {
                listener.set_nonblocking(true)?;
                verifier.serve(UnixListener::from_std(listener)?).await
            }
            None => std::future::pending().await,
        }
    };
    tokio::select! {
        () = idle.wait(IDLE_TIMEOUT) => {}
        served = listening => served?,
    }
    connection.release_name(NAME).await?;
    Ok(())
}
