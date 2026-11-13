pub mod follows;
mod session;
pub mod signin;

use std::fs;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};

use luft_store_seal::invited_document;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::signed::{self, Age, NO_ACCESS, SIGNED_OUT};
use super::{API, DOWNLOADS, device, record};
use follows::{Lost, Notices};
use session::Account;

const AUTH: &str = "https://schelf.store/api/auth/";
const INVITED_FILES: &str = "invited/";

/// A listing as read, with where schelf.store keeps it.
type Read = Result<(String, Vec<u8>), String>;

/// An invite-only channel of an app on schelf.store that you may follow.
#[derive(Serialize, Deserialize, Clone, Type)]
pub struct Invitation {
    pub app: String,
    pub name: String,
    pub channel: String,
    pub page: String,
}

#[derive(Deserialize)]
struct Offered {
    #[serde(flatten)]
    invitation: Invitation,
    index: String,
}

impl Offered {
    /// Only an invitation whose listing is where Schelf expects it counts.
    fn checked(self) -> Option<Invitation> {
        let document = invited_document(&self.invitation.app, &self.invitation.channel)?;
        (self.index == format!("{DOWNLOADS}{document}")).then_some(self.invitation)
    }
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AccountState {
    account: Option<Account>,
    invitations: Vec<Invitation>,
    notices: Notices,
}

/// Removes a file Schelf keeps, which may not be there.
fn remove(path: &Path) -> Result<(), String> {
    match fs::remove_file(path) {
        Err(error) if error.kind() != ErrorKind::NotFound => Err(error.to_string()),
        _ => Ok(()),
    }
}

fn invitations_path() -> PathBuf {
    device::folder().join("invitations.json")
}

fn invitations() -> Vec<Invitation> {
    if session::account().is_none() {
        return Vec::new();
    }
    fs::read(invitations_path())
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
        .unwrap_or_default()
}

fn keep_invitations(invitations: &[Invitation]) -> Result<(), String> {
    let text = serde_json::to_vec_pretty(invitations).map_err(|error| error.to_string())?;
    crate::disk::replace(&invitations_path(), &text).map_err(|error| error.to_string())
}

/// Signs this computer out locally once schelf.store stopped taking its
/// session, keeping the invited channels you follow for when you're back.
fn ended() -> Result<(), String> {
    session::forget()?;
    follows::tell(|notices| notices.ended = true)
}

/// Asks schelf.store again which invite-only channels you may follow.
pub fn refresh() -> Result<(), String> {
    let Some(token) = session::token()? else {
        return Ok(());
    };
    match session::get::<Vec<Offered>>(&format!("{API}invited"), &token) {
        Ok(offered) => keep_invitations(
            &offered
                .into_iter()
                .filter_map(Offered::checked)
                .collect::<Vec<_>>(),
        ),
        Err(error) if error == SIGNED_OUT => ended(),
        Err(error) => Err(error),
    }
}

/// The invite-only channels of `id` you may follow.
pub fn offered(id: &str) -> Vec<String> {
    invitations()
        .into_iter()
        .filter(|invitation| invitation.app.eq_ignore_ascii_case(id))
        .map(|invitation| invitation.channel)
        .collect()
}

/// The invited channel of `id` you follow, while you're signed in.
pub fn followed(id: &str) -> Option<String> {
    session::account()?;
    follows::get(id)
}

/// Follows `channel` of `id` when it's one you were invited to, and says
/// whether it was. Any other channel stops following an invited one.
pub fn follow(id: &str, channel: &str) -> Result<bool, String> {
    let invited = offered(id).iter().any(|offered| offered == channel);
    follows::set(id, invited.then_some(channel))?;
    Ok(invited)
}

fn name_of(id: &str) -> String {
    record::get(id)
        .map(|installed| installed.name)
        .or_else(|| {
            invitations()
                .into_iter()
                .find(|invitation| invitation.app.eq_ignore_ascii_case(id))
                .map(|invitation| invitation.name)
        })
        .unwrap_or_else(|| id.to_owned())
}

/// Acts on schelf.store taking back your invitation to `id`: you go back to
/// its public releases and hear about it once.
fn lost(id: &str) -> Result<(), String> {
    let gone: Vec<Invitation> = invitations()
        .into_iter()
        .filter(|invitation| !invitation.app.eq_ignore_ascii_case(id))
        .collect();
    keep_invitations(&gone)?;
    let Some(channel) = follows::get(id) else {
        return Ok(());
    };
    let lost = Lost {
        name: name_of(id),
        channel,
    };
    follows::set(id, None)?;
    follows::tell(|notices| {
        if !notices.lost.contains(&lost) {
            notices.lost.push(lost);
        }
    })
}

/// The listing of `id` to read and where it's kept: the one for the invited
/// channel you follow or, short of that, one you're invited to, which hold
/// its public releases too. Otherwise, or once that invitation is gone, the
/// public one.
pub fn listing(id: &str, age: Age) -> Read {
    let channel = followed(id).or_else(|| offered(id).into_iter().next());
    let invited = match channel.and_then(|channel| invited_document(id, &channel)) {
        Some(document) => session::token()?.map(|token| (document, token)),
        None => None,
    };
    let public = || {
        let document = luft_store_seal::listing_document(id);
        signed::fetch(&document, age).map(|bytes| (document, bytes))
    };
    choose(
        invited,
        |document, token| signed::fetch_invited(document, age, token),
        public,
        |refusal| refused(id, refusal),
    )
}

/// Acts on schelf.store refusing the session for `id`: the invitation was
/// taken back, or your sign-in ended.
fn refused(id: &str, refusal: Refusal) -> Result<(), String> {
    match refusal {
        Refusal::TakenBack => lost(id),
        Refusal::SignedOut => ended(),
    }
}

#[derive(Debug, PartialEq, Eq)]
enum Refusal {
    TakenBack,
    SignedOut,
}

impl Refusal {
    fn of(error: &str) -> Option<Self> {
        match error {
            NO_ACCESS => Some(Self::TakenBack),
            SIGNED_OUT => Some(Self::SignedOut),
            _ => None,
        }
    }
}

fn choose(
    invited: Option<(String, String)>,
    fetch: impl FnOnce(&str, &str) -> Result<Vec<u8>, String>,
    public: impl FnOnce() -> Read,
    refused: impl FnOnce(Refusal) -> Result<(), String>,
) -> Read {
    let Some((document, token)) = invited else {
        return public();
    };
    match fetch(&document, &token) {
        Err(error) => match Refusal::of(&error) {
            Some(refusal) => {
                refused(refusal)?;
                public()
            }
            None => Err(error),
        },
        Ok(bytes) => Ok((document, bytes)),
    }
}

/// The session to download `url` with: only files schelf.store keeps for
/// invited people get it.
pub fn session_for(url: &str) -> Result<Option<String>, String> {
    if !url.starts_with(&format!("{DOWNLOADS}{INVITED_FILES}")) {
        return Ok(None);
    }
    session::token()?
        .map(Some)
        .ok_or_else(|| SIGNED_OUT.to_owned())
}

/// What you're told when downloading `id` failed with `error`, after acting
/// on schelf.store refusing your session.
pub fn turned_down(id: &str, error: String) -> String {
    let Some(refusal) = Refusal::of(&error) else {
        return error;
    };
    let name = name_of(id);
    match refused(id, refusal) {
        Ok(()) if error == NO_ACCESS => {
            format!("You no longer have access to this version of {name}.")
        }
        Ok(()) => error,
        Err(failure) => failure,
    }
}

pub fn state() -> AccountState {
    AccountState {
        account: session::account(),
        invitations: invitations(),
        notices: follows::notices(),
    }
}

pub fn sign_out() -> Result<AccountState, String> {
    if let Some(token) = session::token()? {
        session::end(&token);
    }
    session::forget()?;
    follows::clear()?;
    remove(&invitations_path())?;
    Ok(state())
}

pub fn poll(interval_ms: u64) -> Result<signin::SignIn, String> {
    let progress = signin::poll(interval_ms)?;
    if matches!(progress, signin::SignIn::Approved { .. }) {
        follows::tell(|notices| notices.ended = false)?;
        if let Err(error) = refresh() {
            eprintln!("Schelf couldn't ask schelf.store what you're invited to: {error}");
        }
    }
    Ok(progress)
}

#[cfg(test)]
mod tests {
    use std::cell::Cell;

    use super::{NO_ACCESS, Read, Refusal, SIGNED_OUT, choose};

    const INVITED: &str = "invited/index/v1/apps/io.example.Tide/testers.json";
    const PUBLIC: &str = "index/v1/apps/io.example.Tide.json";

    fn read(invited: bool, answer: Result<Vec<u8>, String>) -> (Read, Option<Refusal>) {
        let refused = Cell::new(None);
        let read = choose(
            invited.then(|| (INVITED.to_owned(), "session".to_owned())),
            |document, token| {
                assert_eq!((document, token), (INVITED, "session"));
                answer
            },
            || Ok((PUBLIC.to_owned(), b"public".to_vec())),
            |refusal| {
                refused.set(Some(refusal));
                Ok(())
            },
        );
        (read, refused.into_inner())
    }

    #[test]
    fn an_invited_listing_is_read_with_the_session_and_kept_apart() {
        let (read, refused) = read(true, Ok(b"invited".to_vec()));
        assert_eq!(read.unwrap(), (INVITED.to_owned(), b"invited".to_vec()));
        assert_eq!(refused, None);
    }

    #[test]
    fn a_taken_back_invitation_goes_back_to_the_public_listing() {
        let (read, refused) = read(true, Err(NO_ACCESS.to_owned()));
        assert_eq!(read.unwrap().0, PUBLIC);
        assert_eq!(refused, Some(Refusal::TakenBack));
    }

    #[test]
    fn an_ended_sign_in_goes_back_to_the_public_listing() {
        let (read, refused) = read(true, Err(SIGNED_OUT.to_owned()));
        assert_eq!(read.unwrap().0, PUBLIC);
        assert_eq!(refused, Some(Refusal::SignedOut));
    }

    #[test]
    fn being_offline_keeps_the_invited_channel() {
        let (read, refused) = read(true, Err("offline".to_owned()));
        assert_eq!(read.unwrap_err(), "offline");
        assert_eq!(refused, None);
    }

    #[test]
    fn without_an_invitation_the_public_listing_is_read() {
        let (read, refused) = read(false, Ok(Vec::new()));
        assert_eq!(read.unwrap().0, PUBLIC);
        assert_eq!(refused, None);
    }
}
