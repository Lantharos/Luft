use super::rebar;
use crate::incident::{Action, Incident, Suggestion};

fn resizable_bar() -> Option<Suggestion> {
    let window = rebar::small_windows().into_iter().next()?;
    Some(Suggestion {
        step: "Turn on Above 4G Decoding and Resizable BAR in the firmware settings".into(),
        detail: format!(
            "Your {} can let the processor reach up to {} MB of its memory, but only {} MB can be reached right now. \
             Apps that play video or use the graphics card heavily can run out of that space, and the driver can stop responding when they do. \
             In the firmware settings, turn on Above 4G Decoding and Resizable BAR. Some firmware calls it Re-Size BAR Support or Smart Access Memory.",
            window.card, window.largest_mib, window.current_mib
        ),
        action: Some(Action::FirmwareSettings),
    })
}

fn loose_card(incident: &Incident) -> Option<Suggestion> {
    let lost = incident
        .evidence
        .iter()
        .chain(&incident.kernel_messages)
        .any(|line| line.contains("fallen off the bus"));
    lost.then(|| Suggestion {
        step: "Check that the graphics card sits firmly and its power cables are connected".into(),
        detail: "The computer lost contact with the graphics card, which usually comes from power delivery or a loose connection rather than from software.".into(),
        action: None,
    })
}

pub fn compute(incident: &Incident) -> Vec<Suggestion> {
    [resizable_bar(), loose_card(incident)]
        .into_iter()
        .flatten()
        .collect()
}

pub fn wants_firmware_settings(suggestions: &[Suggestion]) -> bool {
    suggestions
        .iter()
        .any(|suggestion| suggestion.action == Some(Action::FirmwareSettings))
}
