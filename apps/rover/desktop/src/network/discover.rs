use std::sync::mpsc;

use gio::prelude::*;
use serde::Serialize;

const NETWORK: &str = "network:///";
const ATTRIBUTES: &str = "standard::display-name,standard::target-uri";
const BATCH: i32 = 64;

#[derive(Serialize)]
pub struct Place {
    name: String,
    uri: String,
}

pub fn browse(reply: mpsc::Sender<Result<Vec<Place>, String>>) {
    gio::File::for_uri(NETWORK).enumerate_children_async(
        ATTRIBUTES,
        gio::FileQueryInfoFlags::NONE,
        gio::glib::Priority::DEFAULT,
        gio::Cancellable::NONE,
        move |result| match result {
            Ok(children) => collect(children, Vec::new(), reply),
            Err(error) => {
                let _ = reply.send(Err(error.message().to_owned()));
            }
        },
    );
}

fn collect(
    children: gio::FileEnumerator,
    mut places: Vec<Place>,
    reply: mpsc::Sender<Result<Vec<Place>, String>>,
) {
    children.clone().next_files_async(
        BATCH,
        gio::glib::Priority::DEFAULT,
        gio::Cancellable::NONE,
        move |result| {
            let infos = result.unwrap_or_default();
            if infos.is_empty() {
                let _ = reply.send(Ok(places));
                return;
            }
            places.extend(infos.iter().filter_map(place));
            collect(children, places, reply);
        },
    );
}

fn place(info: &gio::FileInfo) -> Option<Place> {
    let uri = info.attribute_string("standard::target-uri")?.to_string();
    url::Url::parse(&uri).ok()?.host_str()?;
    Some(Place {
        name: info.display_name().to_string(),
        uri,
    })
}
