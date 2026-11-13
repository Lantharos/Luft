use luft_app::{Commands, Empty};
use sabine::SabineWindow;
use schelf_core::store::invited::{follows, poll, refresh, sign_out, signin, state};
use serde::Deserialize;
use specta::Type;

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
