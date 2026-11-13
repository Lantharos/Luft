//! A stand-in for schelf.store's publisher API, to develop the developer view
//! against: a publisher with projects in every state, serving
//! `http://127.0.0.1:<port>`, with someone signed in through a stand-in
//! Luft Keyring.
//!
//! Run it on a session bus of its own, with a scratch home, and start a debug
//! build of the app on that bus with the same home and `SCHELF_API` pointing
//! at it. The proxy keeps the app's other requests away from schelf.store,
//! which would end a session it doesn't know:
//!
//! ```sh
//! cargo build -p schelf --bins --examples
//! export HOME=$scratch SCHELF_API=http://127.0.0.1:8790 HTTPS_PROXY=http://127.0.0.1:9 NO_PROXY=127.0.0.1
//! dbus-run-session -- sh -c 'target/debug/examples/store 8790 & target/debug/schelf'
//! ```

mod approvals;
mod dates;
mod fixtures;
mod http;
mod keyring;
mod releases;
mod routes;
mod state;

use std::net::TcpListener;
use std::sync::{Arc, Mutex};

use state::State;

const DEFAULT_PORT: u16 = 8790;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), String> {
    let port = std::env::args()
        .nth(1)
        .map_or(Ok(DEFAULT_PORT), |port| port.parse())
        .map_err(|_| "The port is a number".to_owned())?;
    let _keyring = keyring::serve().await?;
    let listener = TcpListener::bind(("127.0.0.1", port)).map_err(|error| error.to_string())?;
    eprintln!("The stand-in store is at http://127.0.0.1:{port}");
    let state = Arc::new(Mutex::new(State::new()));
    tokio::task::spawn_blocking(move || http::serve(&listener, &state))
        .await
        .map_err(|error| error.to_string())
}
