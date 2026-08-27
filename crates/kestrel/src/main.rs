use clap::Parser;
use kestrel::runtime::RuntimeOptions;
use std::process::ExitCode;

#[derive(Debug, Parser)]
#[command(name = "kestrel", about = "Luft Wayland compositor")]
struct Args {
    #[arg(long, conflicts_with = "session")]
    nested: bool,
    #[arg(long, conflicts_with = "nested")]
    session: bool,
    #[arg(long)]
    socket: Option<String>,
    #[arg(long)]
    no_shell: bool,
}

fn main() -> ExitCode {
    init_logging();
    let args = Args::parse();
    let runtime = RuntimeOptions::new(args.socket, !args.no_shell, args.nested);

    if args.nested {
        #[cfg(feature = "nested")]
        {
            kestrel::winit::run_winit(runtime);
            return ExitCode::SUCCESS;
        }
        #[cfg(not(feature = "nested"))]
        tracing::error!("Kestrel was built without the nested backend");
    } else if args.session {
        #[cfg(feature = "session-backend")]
        {
            kestrel::udev::run_udev(runtime);
            return ExitCode::SUCCESS;
        }
        #[cfg(not(feature = "session-backend"))]
        tracing::error!("Kestrel was built without the session backend");
    } else {
        tracing::error!("expected --nested or --session");
    }

    ExitCode::FAILURE
}

fn init_logging() {
    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("kestrel=info,smithay=warn"));
    tracing_subscriber::fmt()
        .compact()
        .with_env_filter(filter)
        .init();
}
