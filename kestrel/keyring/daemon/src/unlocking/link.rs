use std::path::Path;
use std::time::Duration;

use luft_keyring_wire::{
    Event, FrameError, Problem, Reply, Request, SOCKET, read_async, write_async,
};
use tokio::net::UnixStream;
use tokio::sync::mpsc;

const TIMEOUT: Duration = Duration::from_secs(15);

pub fn available() -> bool {
    Path::new(SOCKET).exists()
}

pub async fn request(request: Request) -> Result<Reply, Problem> {
    let exchange = async {
        let mut stream = UnixStream::connect(SOCKET).await?;
        write_async(&mut stream, &request).await?;
        read_async::<Reply>(&mut stream).await
    };
    match tokio::time::timeout(TIMEOUT, exchange).await {
        Ok(Ok(Reply::Refused(problem))) => Err(problem),
        Ok(Ok(reply)) => Ok(reply),
        Ok(Err(error)) => Err(Problem::Failed(error.to_string())),
        Err(_) => Err(Problem::Failed("the unlock service didn't answer".into())),
    }
}

pub async fn attach(events: mpsc::UnboundedSender<Event>) -> Result<(), FrameError> {
    let mut stream = UnixStream::connect(SOCKET).await?;
    write_async(&mut stream, &Request::Attach).await?;
    match read_async::<Reply>(&mut stream).await? {
        Reply::Done => {}
        reply => return Err(FrameError::Io(std::io::Error::other(format!("{reply:?}")))),
    }
    tokio::spawn(async move {
        while let Ok(event) = read_async::<Event>(&mut stream).await {
            if events.send(event).is_err() {
                break;
            }
        }
    });
    Ok(())
}
