mod access;
mod error;
mod files;
mod idle;
mod options;
mod service;
mod store;
mod system;

use std::path::Path;
use std::process::ExitCode;
use std::sync::Arc;
use std::time::Duration;

use idle::Idle;
use options::Options;
use service::Greeter;
use system::greetd::Greetd;

const NAME: &str = "com.lantharos.Greeter1";
const PATH: &str = "/com/lantharos/Greeter1";
const IDLE_TIMEOUT: Duration = Duration::from_secs(60);

#[tokio::main(flavor = "current_thread")]
async fn main() -> ExitCode {
    let options = match Options::parse(std::env::args().skip(1)) {
        Ok(options) => options,
        Err(message) => {
            eprintln!("{message}");
            return ExitCode::from(2);
        }
    };
    if let Some(path) = &options.write_greetd_config {
        return write_greetd_config(&options, path);
    }
    match serve(options).await {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Couldn't serve {NAME}: {error}");
            ExitCode::FAILURE
        }
    }
}

fn write_greetd_config(options: &Options, path: &Path) -> ExitCode {
    match Greetd::new(&options.state_dir).write_config(path) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("Couldn't write {}: {error}", path.display());
            ExitCode::FAILURE
        }
    }
}

async fn serve(options: Options) -> zbus::Result<()> {
    let idle = Arc::new(Idle::default());
    let connection = zbus::connection::Builder::system()
        .serve_at(PATH, Greeter::new(options, idle.clone()))
        .name(NAME)
        .build()
        .await?;
    idle.wait(IDLE_TIMEOUT).await;
    connection.release_name(NAME).await?;
    Ok(())
}
