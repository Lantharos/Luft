use crate::schema::permissions::Permissions;

fn folder(place: &str) -> &'static str {
    match place {
        "home" => "your home folder",
        "xdg-desktop" => "Desktop",
        "xdg-documents" => "Documents",
        "xdg-download" => "Downloads",
        "xdg-music" => "Music",
        "xdg-pictures" => "Pictures",
        _ => "Videos",
    }
}

fn device(name: &str) -> &'static str {
    match name {
        "usb" => "USB devices",
        "serial" => "serial ports",
        _ => "every device",
    }
}

/// What a declaration lets an app do, in the words of its store page.
pub fn describe_permissions(permissions: Option<&Permissions>) -> Vec<String> {
    let Some(permissions) = permissions else {
        return vec!["Full access, since nothing is declared".into()];
    };
    if let Some(reason) = &permissions.unsandboxed {
        return vec![format!("Full access: {reason}")];
    }
    let mut lines = vec![if permissions.network {
        "Goes online".to_owned()
    } else {
        "Stays offline".to_owned()
    }];
    for place in &permissions.filesystems {
        let (name, verb) = match place.strip_suffix(":ro") {
            Some(name) => (name, "Reads"),
            None => (place.as_str(), "Reads and changes"),
        };
        lines.push(format!("{verb} {}", folder(name)));
    }
    for name in &permissions.devices {
        lines.push(format!("Uses {}", device(name)));
    }
    if permissions.microphone {
        lines.push("Uses the microphone".into());
    }
    if permissions.camera {
        lines.push("Uses the camera".into());
    }
    if permissions.x11 {
        lines.push("Shows its windows through X11".into());
    }
    for name in &permissions.talk {
        lines.push(format!("Talks to {name}"));
    }
    lines
}
