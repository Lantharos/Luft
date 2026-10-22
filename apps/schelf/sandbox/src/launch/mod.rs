mod devices;
mod fds;
mod folder;
mod mount;
mod profile;
mod proxy;
mod seccomp;
mod unsandboxed;
mod wait;
mod wayland;

use std::process::Command;
use std::time::{Duration, Instant};

use zbus::Connection;

use crate::app::{App, Grants};
use crate::escalate::{self, Reason};
use crate::files;
use crate::request::Request;
use folder::{Folder, Lock};
use profile::Profile;
use wait::Event;

const BWRAP: &str = "bwrap";
const QUICK_EXIT: Duration = Duration::from_secs(8);

pub fn run(id: &str, arguments: Vec<String>) -> i32 {
    match start(id, arguments) {
        Ok(code) => code,
        Err(error) => {
            eprintln!("{id} couldn't start: {error}");
            1
        }
    }
}

fn start(id: &str, arguments: Vec<String>) -> Result<i32, String> {
    let app = App::find(id)?;
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .map_err(|error| error.to_string())?;
    let session = runtime
        .block_on(Connection::session())
        .map_err(|error| error.to_string())?;
    let grants = runtime.block_on(Grants::of(&session, id));
    if grants.full_access {
        let arguments = files::unmarked(arguments);
        return Err(unsandboxed::exec(&app, arguments));
    }
    runtime.block_on(files::mount_point(&session));
    let arguments = runtime.block_on(files::forward(&session, id, arguments))?;
    let folder = Folder::of(id)?;
    match folder.lock()? {
        Lock::Running => {
            folder.wait_for_server()?;
            Request { arguments }
                .send(folder.connect()?)
                .map_err(|error| error.to_string())?;
            Ok(0)
        }
        Lock::Ours(lock) => {
            let outcome = sandbox(&app, &grants, &folder, arguments);
            folder.clean();
            drop(lock);
            let (code, reason) = outcome?;
            if let Some(reason) = reason {
                runtime.block_on(escalate::offer(&session, &app.asking(), reason));
            }
            Ok(code)
        }
    }
}

fn sandbox(
    app: &App,
    grants: &Grants,
    folder: &Folder,
    arguments: Vec<String>,
) -> Result<(i32, Option<Reason>), String> {
    folder.prepare()?;
    let info = folder.write_sandbox_info(&app.id)?;
    let mounted = mount::Image::mount(&app.image, &folder.mount_point())?;
    let proxy = proxy::Proxy::start(folder, &info, &app.id)?;
    let display = wayland::SecurityContext::create(&folder.wayland_socket(), &app.id)?;
    let decoys = devices::Decoys::plant(&folder.decoys(), grants)?;
    let filter = seccomp::filter()?;
    let profile = Profile {
        app,
        grants,
        folder,
        info: &info,
        mount: mounted.path(),
        proxy: proxy.socket(),
        wayland: display.as_ref().map(|_| folder.wayland_socket()),
        decoys: &decoys,
    };
    let instance = folder.instance()?;
    std::fs::create_dir_all(&instance).map_err(|error| error.to_string())?;
    let info_file = std::fs::File::create(instance.join("bwrapinfo.json"))
        .map_err(|error| error.to_string())?;
    let mut command = Command::new(BWRAP);
    command.args(profile.arguments()?);
    filter.pass_to(&mut command);
    fds::pass(&mut command, &info_file, profile::INFO_FD);
    let started = Instant::now();
    let mut child = command.spawn().map_err(|error| error.to_string())?;
    folder.wait_for_server_or(&mut child);
    decoys.opened();
    let Ok(server) = folder.connect() else {
        let _ = child.kill();
        let _ = child.wait();
        return Err("The sandbox couldn't be set up.".into());
    };
    Request { arguments }
        .send(server)
        .map_err(|error| error.to_string())?;
    let mut device_offered = false;
    let status = loop {
        match wait::next(&mut child, &decoys)? {
            Event::Exited(status) => break status,
            Event::DeviceOpened if !device_offered => {
                device_offered = true;
                escalate::offer_in_background(app.asking(), Reason::Device);
            }
            Event::DeviceOpened => {}
        }
    };
    drop(display);
    drop(proxy);
    drop(mounted);
    let _ = std::fs::remove_dir_all(&instance);
    let quick_failure = !status.success() && started.elapsed() < QUICK_EXIT;
    let code = status.code().unwrap_or(1);
    Ok((code, quick_failure.then_some(Reason::Closed)))
}
