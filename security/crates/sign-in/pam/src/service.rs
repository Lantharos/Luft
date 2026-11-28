use std::os::unix::net::UnixStream;
use std::time::Duration;

use luft_sign_in_wire::{Reply, Request, SOCKET, Secret, Way, read, write};

const QUESTION_PATIENCE: Duration = Duration::from_secs(10);
const WAIT_PATIENCE: Duration = Duration::from_secs(320);

fn connect(patience: Duration) -> Option<UnixStream> {
    let stream = UnixStream::connect(SOCKET).ok()?;
    stream.set_write_timeout(Some(QUESTION_PATIENCE)).ok()?;
    stream.set_read_timeout(Some(patience)).ok()?;
    Some(stream)
}

/// Asks the sign-in service. Without an answer from it the password stays
/// allowed, so a service that can't start never locks anyone out.
pub fn password_allowed(user: &str) -> bool {
    let Some(mut stream) = connect(QUESTION_PATIENCE) else {
        return true;
    };
    if write(
        &mut stream,
        &Request::PasswordAllowed {
            user: user.to_owned(),
        },
    )
    .is_err()
    {
        return true;
    }
    !matches!(read::<Reply>(&mut stream), Ok(Reply::Allowed(false)))
}

/// Runs the service's conversation for `way`, handing each question and
/// notice to `relay`, and returns how it ended.
pub fn verify(
    user: &str,
    way: Way,
    mut relay: impl FnMut(&Reply) -> Option<Vec<u8>>,
) -> Option<Reply> {
    let mut stream = connect(WAIT_PATIENCE)?;
    write(
        &mut stream,
        &Request::Verify {
            user: user.to_owned(),
            way,
        },
    )
    .ok()?;
    loop {
        let reply = read::<Reply>(&mut stream).ok()?;
        match reply {
            Reply::Ask(_) => {
                let answer = relay(&reply)?;
                write(&mut stream, &Request::Answer(Secret::new(answer))).ok()?;
            }
            Reply::Tell(_) => {
                relay(&reply);
            }
            ended => return Some(ended),
        }
    }
}
