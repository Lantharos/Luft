use futures_util::StreamExt;
use luft_software::system::image;

use super::super::overview;
use super::super::state::{self, Activity, Kind};

pub fn watch() {
    luft_app::spawn(async {
        let changes = image::changes().await;
        scan().await;
        let Ok(changes) = changes else {
            return;
        };
        let mut changes = std::pin::pin!(changes);
        while changes.next().await.is_some() {
            scan().await;
        }
    });
}

pub async fn scan() {
    if state::busy() || !image::downloading().await.unwrap_or(false) {
        return;
    }
    state::start(Activity::new(Kind::Download), super::follow, finished);
}

fn finished() {
    overview::reload();
    luft_app::spawn(scan());
}
