mod follows;
mod session;
mod signin;

use std::fs;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};

use luft_app::{Commands, Empty};
use luft_store_seal::invited_document;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::signed::{self, Age, NO_ACCESS};
use super::{API, DOWNLOADS, device, record};
use follows::{Lost, Notices};
use session::Account;

const AUTH: &str = "https://schelf.store/api/auth/";
const INVITED_FILES: &str = "invited/";

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
struct AccountState {
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
    luft_app::files::replace(&invitations_path(), &text).map_err(|error| error.to_string())
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
        Err(error) if error == NO_ACCESS => ended(),
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

/// Acts on schelf.store turning down the session for `id`'s invited
/// listing: the invitation was taken back, so you go back to its public
/// releases and hear about it once, or your sign-in ended.
fn lost(id: &str) -> Result<(), String> {
    let Some(token) = session::token()? else {
        return Ok(());
    };
    if session::whose(&token)?.is_none() {
        return ended();
    }
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
pub fn listing(id: &str, age: Age) -> Result<(String, Vec<u8>), String> {
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
        || lost(id),
    )
}

fn choose(
    invited: Option<(String, String)>,
    fetch: impl FnOnce(&str, &str) -> Result<Vec<u8>, String>,
    public: impl FnOnce() -> Result<(String, Vec<u8>), String>,
    lose: impl FnOnce() -> Result<(), String>,
) -> Result<(String, Vec<u8>), String> {
    let Some((document, token)) = invited else {
        return public();
    };
    match fetch(&document, &token) {
        Err(error) if error == NO_ACCESS => {
            lose()?;
            public()
        }
        fetched => fetched.map(|bytes| (document, bytes)),
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
        .ok_or_else(|| NO_ACCESS.to_owned())
}

/// What you're told when a download of `id` was turned down.
pub fn turned_down(id: &str) -> String {
    let name = name_of(id);
    match lost(id) {
        Ok(()) => format!("You no longer have access to this version of {name}."),
        Err(error) => error,
    }
}

fn state() -> AccountState {
    AccountState {
        account: session::account(),
        invitations: invitations(),
        notices: follows::notices(),
    }
}

fn sign_out() -> Result<AccountState, String> {
    if let Some(token) = session::token()? {
        session::end(&token);
    }
    session::forget()?;
    follows::clear()?;
    remove(&invitations_path())?;
    Ok(state())
}

fn poll(interval_ms: u64) -> Result<signin::SignIn, String> {
    let progress = signin::poll(interval_ms)?;
    if matches!(progress, signin::SignIn::Approved { .. }) {
        follows::tell(|notices| notices.ended = false)?;
        if let Err(error) = refresh() {
            eprintln!("Schelf couldn't ask schelf.store what you're invited to: {error}");
        }
    }
    Ok(progress)
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct Poll {
    interval_ms: u64,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("account_state", |Empty {}| Ok(state()))
        .command("account_refresh", |Empty {}| {
            refresh()?;
            Ok(state())
        })
        .command("account_sign_in", |Empty {}| signin::start())
        .command("account_sign_in_poll", |Poll { interval_ms }| {
            poll(interval_ms)
        })
        .command("account_sign_in_cancel", |Empty {}| {
            signin::cancel();
            Ok(())
        })
        .command("account_sign_out", |Empty {}| sign_out())
        .command("account_dismiss", |Empty {}| {
            follows::dismiss()?;
            Ok(state())
        })
}

#[cfg(test)]
mod tests {
    use std::cell::Cell;

    use super::{NO_ACCESS, choose};

    const INVITED: &str = "invited/index/v1/apps/io.example.Tide/testers.json";
    const PUBLIC: &str = "index/v1/apps/io.example.Tide.json";

    fn read(
        invited: bool,
        answer: Result<Vec<u8>, String>,
    ) -> (Result<(String, Vec<u8>), String>, bool) {
        let lost = Cell::new(false);
        let read = choose(
            invited.then(|| (INVITED.to_owned(), "session".to_owned())),
            |document, token| {
                assert_eq!((document, token), (INVITED, "session"));
                answer
            },
            || Ok((PUBLIC.to_owned(), b"public".to_vec())),
            || {
                lost.set(true);
                Ok(())
            },
        );
        (read, lost.get())
    }

    #[test]
    fn an_invited_listing_is_read_with_the_session_and_kept_apart() {
        let (read, lost) = read(true, Ok(b"invited".to_vec()));
        assert_eq!(read.unwrap(), (INVITED.to_owned(), b"invited".to_vec()));
        assert!(!lost);
    }

    #[test]
    fn a_turned_down_session_goes_back_to_the_public_listing() {
        let (read, lost) = read(true, Err(NO_ACCESS.to_owned()));
        assert_eq!(read.unwrap().0, PUBLIC);
        assert!(lost);
    }

    #[test]
    fn being_offline_keeps_the_invited_channel() {
        let (read, lost) = read(true, Err("offline".to_owned()));
        assert_eq!(read.unwrap_err(), "offline");
        assert!(!lost);
    }

    #[test]
    fn without_an_invitation_the_public_listing_is_read() {
        let (read, lost) = read(false, Ok(Vec::new()));
        assert_eq!(read.unwrap().0, PUBLIC);
        assert!(!lost);
    }
}
