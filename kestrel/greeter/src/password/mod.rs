mod error;
mod pam;
mod quality;
mod service;

use std::ffi::CString;
use std::fs::File;
use std::io::Read;
use std::os::fd::OwnedFd;

use nix::unistd::{Uid, User};
use zeroize::Zeroizing;

use crate::system::users;
use error::Error;
pub use service::serve;

pub const FLAG: &str = "--passwords";
const LONGEST: u64 = 1024;

type Password = Zeroizing<CString>;

pub fn read(source: OwnedFd) -> Result<Password, Error> {
    let unreadable = || Error::InvalidArgs("The password couldn't be read".into());
    let mut bytes = Zeroizing::new(Vec::new());
    File::from(source)
        .take(LONGEST + 1)
        .read_to_end(&mut bytes)
        .map_err(|_| unreadable())?;
    if bytes.len() as u64 > LONGEST {
        return Err(unreadable());
    }
    CString::new(std::mem::take(&mut *bytes))
        .map(Zeroizing::new)
        .map_err(|_| unreadable())
}

fn account(uid: u32) -> Result<CString, Error> {
    User::from_uid(Uid::from_raw(uid))
        .ok()
        .flatten()
        .filter(|user| users::is_regular(&user.name))
        .and_then(|user| CString::new(user.name).ok())
        .ok_or_else(Error::not_authorized)
}

pub fn change(uid: u32, current: &Password, new: &Password) -> Result<(), Error> {
    let user = account(uid)?;
    let weakness = quality::weakness(&user, current, new).map_err(|error| {
        eprintln!("Couldn't check the new password: {error}");
        Error::failed()
    })?;
    if let Some(kind) = weakness {
        return Err(Error::TooWeak(kind.into()));
    }
    match pam::change(&user, current, new) {
        pam::Outcome::Changed => Ok(()),
        pam::Outcome::WrongPassword => Err(Error::WrongPassword(
            "The current password isn't right".into(),
        )),
        pam::Outcome::Refused => Err(Error::TooWeak(quality::REJECTED.into())),
        pam::Outcome::Failed(status) => {
            eprintln!("Changing the password failed with PAM status {status}");
            Err(Error::failed())
        }
    }
}
