use crate::api::dashboard::text;
use crate::args::Args;
use crate::commands::context::{Verb, publisher_of, signed_in, verbs};
use crate::error::Result;
use crate::ui::OK;
use crate::ui::output::{blank, emit, field, note, title};
use crate::ui::style::link;

fn status(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let owner = publisher_of(&context, args)?;
    let state = context.dashboard.verification(text(owner, "id"))?;
    emit(&state.raw);
    title(&format!("Verification of {}", text(owner, "name")));
    field(
        "Verified",
        if state.value["verified"].as_bool() == Some(true) {
            "yes"
        } else {
            "no"
        },
    );
    let current = &state.value["current"];
    if current.is_object() {
        let reason = current["reason"]
            .as_str()
            .filter(|reason| !reason.is_empty())
            .map(|reason| format!(": {reason}"))
            .unwrap_or_default();
        field("Request", &format!("{}{reason}", text(current, "status")));
    }
    blank();
    note(
        "Asking for verification is a legal declaration with documents, so it's done in the dashboard:",
    );
    note(&link(&format!(
        "{}/dashboard/settings/verification",
        context.api
    )));
    blank();
    Ok(OK)
}

pub const VERBS: [Verb; 1] = [Verb {
    name: "status",
    usage: "status",
    about: "Whether the publisher is verified, and its request",
    run: status,
}];

pub fn verification(args: &mut Args) -> Result<i32> {
    verbs("verification", &VERBS, args)
}
