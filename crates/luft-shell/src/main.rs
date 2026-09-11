mod apps;
mod color;
mod ipc;
mod panel;
mod services;
mod settings;
mod theme;
mod web;

use clap::Parser;
use luft_config::{ConfigPaths, load_config};
use std::{env, fs, fs::OpenOptions, io};
use tracing::info;

#[derive(Debug, Parser)]
#[command(name = "luft-shell", about = "Luft shell process")]
struct ShellArgs {
    #[arg(long)]
    once: bool,
    #[arg(long)]
    settings: Option<String>,
    #[arg(long)]
    launch_desktop: Option<std::path::PathBuf>,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let raw_args = env::args().collect::<Vec<_>>();
    if sabine::dispatch_host_mode_from_args(&raw_args) {
        return Ok(());
    }
    let args = ShellArgs::parse();
    if let Some(path) = &args.launch_desktop {
        return apps::launch_desktop(path);
    }
    if let Some(page) = &args.settings {
        return settings::run(page);
    }
    sabine::adopt_inherited_wayland_broker()?;

    init_logging();

    let loaded = load_config()?;
    info!("luft shell configuration loaded");

    if args.once {
        return Ok(());
    }

    web::run(loaded.config)
}

fn init_logging() {
    tracing_subscriber::fmt()
        .with_ansi(false)
        .with_writer(file_log_writer("luft-shell"))
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("luft_shell=info")),
        )
        .init();
}

fn file_log_writer(component: &'static str) -> impl Fn() -> Box<dyn io::Write + Send> + Clone {
    let path = ConfigPaths::discover()
        .ok()
        .map(|paths| paths.log_file(component));
    move || -> Box<dyn io::Write + Send> {
        let Some(path) = &path else {
            return Box::new(io::stderr());
        };
        if let Some(parent) = path.parent()
            && fs::create_dir_all(parent).is_err()
        {
            return Box::new(io::stderr());
        }
        match OpenOptions::new().create(true).append(true).open(path) {
            Ok(file) => Box::new(file),
            Err(_) => Box::new(io::stderr()),
        }
    }
}
