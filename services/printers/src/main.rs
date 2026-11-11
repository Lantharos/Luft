mod queues;
mod service;
mod usb;

use std::process::ExitCode;

fn main() -> ExitCode {
    luft_dbus::panics::report();
    let command = std::env::args().nth(1);
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build();
    let result = runtime.map_err(anyhow::Error::from).and_then(|runtime| {
        runtime.block_on(async {
            match command.as_deref() {
                None => service::serve().await,
                Some("usb") => usb::set_up().await,
                Some(other) => Err(anyhow::anyhow!("Unknown command {other}")),
            }
        })
    });
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}
