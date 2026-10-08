use std::ffi::CString;
use std::io::BufReader;
use std::os::unix::net::UnixStream;
use std::path::PathBuf;

use pulseaudio::protocol::{
    self, AuthParams, AuthReply, Command, Prop, Props, SampleInfoList, SetClientNameReply,
};

use crate::context::Context;
use crate::shared::watch::TreeWatch;

const SOUND: &str = "org.gnome.desktop.sound";

type Failure = Box<dyn std::error::Error + Send + Sync>;

pub async fn start(context: &Context) -> zbus::Result<()> {
    let Some(mut settings) = context.settings.watch(&[SOUND]).await else {
        return Ok(());
    };
    let mut themes = TreeWatch::new(theme_directories())?;
    tokio::spawn(async move {
        loop {
            tokio::select! {
                (_, key) = settings.changed() => if key != "theme-name" { continue },
                () = themes.changed() => {}
            }
            if let Ok(Err(error)) = tokio::task::spawn_blocking(forget_theme_sounds).await {
                eprintln!("Couldn't refresh the cached event sounds: {error}");
            }
        }
    });
    Ok(())
}

fn theme_directories() -> Vec<PathBuf> {
    std::iter::once(glib::user_data_dir())
        .chain(glib::system_data_dirs())
        .map(|directory| directory.join("sounds"))
        .collect()
}

fn forget_theme_sounds() -> Result<(), Failure> {
    let socket = pulseaudio::socket_path_from_env().ok_or("The sound server isn't running")?;
    let mut server = BufReader::new(UnixStream::connect(socket)?);
    let cookie = pulseaudio::cookie_path_from_env()
        .and_then(|path| std::fs::read(path).ok())
        .unwrap_or_default();
    let auth = AuthParams {
        version: protocol::MAX_VERSION,
        supports_shm: false,
        supports_memfd: false,
        cookie,
    };
    protocol::write_command_message(
        server.get_mut(),
        0,
        &Command::Auth(auth),
        protocol::MAX_VERSION,
    )?;
    let (_, reply) = protocol::read_reply_message::<AuthReply>(&mut server, protocol::MAX_VERSION)?;
    let version = protocol::MAX_VERSION.min(reply.version);
    let mut name = Props::new();
    name.set(Prop::ApplicationName, CString::new("Kestrel settings")?);
    protocol::write_command_message(server.get_mut(), 1, &Command::SetClientName(name), version)?;
    protocol::read_reply_message::<SetClientNameReply>(&mut server, version)?;
    protocol::write_command_message(server.get_mut(), 2, &Command::GetSampleInfoList, version)?;
    let (_, samples) = protocol::read_reply_message::<SampleInfoList>(&mut server, version)?;
    let themed = samples
        .into_iter()
        .filter(|sample| sample.props.get(Prop::EventId).is_some());
    for (sequence, sample) in (3..).zip(themed) {
        protocol::write_command_message(
            server.get_mut(),
            sequence,
            &Command::RemoveSample(sample.name),
            version,
        )?;
        protocol::read_ack_message(&mut server)?;
    }
    Ok(())
}
