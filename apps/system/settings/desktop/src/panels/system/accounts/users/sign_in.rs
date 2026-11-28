use std::sync::OnceLock;

use futures_util::StreamExt;
use luft_app::dbus::{self, error_name, explain};
use luft_app::{Commands, Empty, Events};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use specta::Type;
use zbus::message::Type as MessageType;
use zbus::proxy::MethodFlags;
use zbus::zvariant::DynamicDeserialize;
use zbus::{DynamicType, MatchRule, MessageStream, Proxy};

const SERVICE: &str = "com.lantharos.SignIn1";
const PATH: &str = "/com/lantharos/SignIn1";
const ERRORS: &str = "com.lantharos.SignIn1.Error.";
const WAIT_FOR_TOUCH: std::time::Duration = std::time::Duration::from_secs(300);

pub const TOUCH: BridgeEvent<u32> = BridgeEvent::new("sign-in.touch");

type Listed = Vec<(String, String)>;

#[derive(Serialize, Type)]
struct SignInEnrolled {
    id: String,
    name: String,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct SignInMethods {
    security_keys: Vec<SignInEnrolled>,
    smart_cards: Vec<SignInEnrolled>,
    password: bool,
    can_turn_off_password: bool,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct FoundSecurityKey {
    found: bool,
    has_pin: bool,
    checks_fingerprints: bool,
}

#[derive(Serialize, Type)]
struct FoundSmartCard {
    found: bool,
    name: String,
}

#[derive(Deserialize, Type)]
struct SignInPin {
    pin: String,
}

#[derive(Deserialize, Type)]
struct SignInId {
    id: String,
}

#[derive(Deserialize, Type)]
struct PasswordSignIn {
    allowed: bool,
}

/// Why adding or changing failed, for the page to say in its own words.
#[derive(Serialize, Type)]
#[serde(rename_all = "kebab-case")]
enum SignInRefusal {
    NotAuthorized,
    NoKey,
    NoCard,
    WrongPin,
    Blocked,
    PinTooSimple,
    TimedOut,
    AlreadyEnrolled,
    NothingElse,
    Failed,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase", tag = "outcome", content = "refusal")]
enum SignInChange {
    Done,
    Refused(SignInRefusal),
}

fn refusal(error: &zbus::Error) -> Option<SignInRefusal> {
    let name = error_name(error)?;
    Some(match name.strip_prefix(ERRORS)? {
        "NotAuthorized" => SignInRefusal::NotAuthorized,
        "NoKey" => SignInRefusal::NoKey,
        "NoCard" => SignInRefusal::NoCard,
        "WrongPin" => SignInRefusal::WrongPin,
        "Blocked" => SignInRefusal::Blocked,
        "PinTooSimple" => SignInRefusal::PinTooSimple,
        "TimedOut" => SignInRefusal::TimedOut,
        "AlreadyEnrolled" => SignInRefusal::AlreadyEnrolled,
        "NothingElse" => SignInRefusal::NothingElse,
        _ => SignInRefusal::Failed,
    })
}

async fn service() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system().await?, SERVICE, PATH, SERVICE)
        .await
        .map_err(|error| explain(&error))
}

async fn call<R: for<'d> DynamicDeserialize<'d>>(
    method: &str,
    body: &(impl Serialize + DynamicType),
) -> Result<R, zbus::Error> {
    service()
        .await
        .map_err(zbus::Error::Failure)?
        .call_with_flags::<_, _, R>(method, MethodFlags::ALLOW_INTERACTIVE_AUTH, body)
        .await
        .map(|reply| reply.expect("a method that answers"))
}

async fn change<R: for<'d> DynamicDeserialize<'d>>(
    method: &str,
    body: &(impl Serialize + DynamicType),
) -> Result<SignInChange, String> {
    match call::<R>(method, body).await {
        Ok(_) => Ok(SignInChange::Done),
        Err(error) => refusal(&error)
            .map(SignInChange::Refused)
            .ok_or_else(|| explain(&error)),
    }
}

async fn methods(Empty {}: Empty) -> Result<SignInMethods, String> {
    let (keys, cards, password, can_turn_off_password): (Listed, Listed, bool, bool) =
        call("Methods", &())
            .await
            .map_err(|error| explain(&error))?;
    let listed = |entries: Listed| {
        entries
            .into_iter()
            .map(|(id, name)| SignInEnrolled { id, name })
            .collect()
    };
    Ok(SignInMethods {
        security_keys: listed(keys),
        smart_cards: listed(cards),
        password,
        can_turn_off_password,
    })
}

async fn find_key(Empty {}: Empty) -> Result<FoundSecurityKey, String> {
    let (found, has_pin, checks_fingerprints) = call("FindSecurityKey", &())
        .await
        .map_err(|error| explain(&error))?;
    Ok(FoundSecurityKey {
        found,
        has_pin,
        checks_fingerprints,
    })
}

async fn find_card(Empty {}: Empty) -> Result<FoundSmartCard, String> {
    let (found, name) = call("FindSmartCard", &())
        .await
        .map_err(|error| explain(&error))?;
    Ok(FoundSmartCard { found, name })
}

async fn listen_for_touches(events: Events) {
    let Ok(system) = dbus::system().await else {
        return;
    };
    let Ok(rule) = MatchRule::builder()
        .msg_type(MessageType::Signal)
        .sender(SERVICE)
        .interface(SERVICE)
        .member("TouchSecurityKey")
        .build()
    else {
        return;
    };
    let Ok(mut messages) = MessageStream::for_match_rule(rule, system, None).await else {
        return;
    };
    while let Some(message) = messages.next().await {
        if let Ok(step) = message.and_then(|message| message.body().deserialize::<u32>()) {
            events.emit(TOUCH, step);
        }
    }
}

async fn add_key(events: Events, SignInPin { pin }: SignInPin) -> Result<SignInChange, String> {
    static LISTENING: OnceLock<()> = OnceLock::new();
    LISTENING.get_or_init(|| {
        luft_app::spawn(listen_for_touches(events));
    });
    tokio::time::timeout(WAIT_FOR_TOUCH, change::<String>("AddSecurityKey", &pin))
        .await
        .unwrap_or(Ok(SignInChange::Refused(SignInRefusal::TimedOut)))
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&TOUCH)
        .command_async("sign_in_methods", methods)
        .command_async("sign_in_find_key", find_key)
        .with_async("sign_in_add_key", events, add_key)
        .command_async("sign_in_remove_key", |SignInId { id }| async move {
            change::<()>("RemoveSecurityKey", &id).await
        })
        .command_async("sign_in_find_card", find_card)
        .command_async("sign_in_add_card", |SignInPin { pin }| async move {
            change::<String>("AddSmartCard", &pin).await
        })
        .command_async("sign_in_remove_card", |SignInId { id }| async move {
            change::<()>("RemoveSmartCard", &id).await
        })
        .command_async(
            "sign_in_set_password",
            |PasswordSignIn { allowed }| async move {
                change::<()>("SetPasswordSignIn", &allowed).await
            },
        )
}
