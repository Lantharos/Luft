mod boot;
mod daemon;
mod incident;
mod system;

use std::process::ExitCode;

#[tokio::main(flavor = "current_thread")]
async fn main() -> ExitCode {
    match std::env::args().nth(1).as_deref() {
        None => daemon::run().await,
        Some("boot") => boot::run().await,
        Some(other) => {
            eprintln!(
                "There's no command called {other}. Run without arguments to watch, or with boot after a restart."
            );
            ExitCode::from(2)
        }
    }
}
