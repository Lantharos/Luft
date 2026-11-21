use luft_app::{Appearance, Commands};
use sabine::{SabineWindow, WindowRegion};
use serde::{Deserialize, Serialize};
use specta::datatype::DataType;
use specta::{Type, Types};
use tokio::sync::oneshot;

use super::{RADIUS, frame};
use crate::windows::{Windows, file_title};

const SIZE: (u32, u32) = (420, 240);

/// What a dialog shows, as the install window that opened it described it.
#[derive(Clone, Deserialize, Serialize)]
#[serde(transparent)]
struct Content(serde_json::Value);

impl Type for Content {
    fn definition(_: &mut Types) -> DataType {
        DataType::Reference(specta_typescript::define(
            "import(\"#lib/install/dialogs/dialog.js\").InstallDialog".to_owned(),
        ))
    }
}

/// A dialog an install window opened as a window of its own, and the answer
/// its opener waits for: `None` when it closed without one.
pub struct Dialog {
    request: u32,
    content: Content,
    answer: oneshot::Sender<Option<bool>>,
}

#[derive(Deserialize, Type)]
struct Open {
    request: u32,
    parent: Option<String>,
    dialog: Content,
}

#[derive(Deserialize, Type)]
struct Shown {
    dialog: u32,
}

#[derive(Deserialize, Type)]
struct Answer {
    dialog: u32,
    answer: bool,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct DialogState {
    #[serde(flatten)]
    appearance: Appearance,
    path: String,
    dialog: Content,
}

fn window(window: SabineWindow, title: &str, dialog: u32, parent: Option<String>) -> SabineWindow {
    let window = frame(window, title)
        .fixed_size(SIZE.0, SIZE.1)
        .transparent(true)
        .opaque_region(WindowRegion::rounded_rect(RADIUS))
        .skip_taskbar(true)
        .modal(true)
        .content_suffix(format!("#install-dialog/{dialog}"));
    match parent {
        Some(parent) => window.parent_window(parent),
        None => window,
    }
}

impl Windows {
    fn open_dialog(
        &self,
        Open {
            request,
            parent,
            dialog: content,
        }: Open,
    ) -> Result<oneshot::Receiver<Option<bool>>, String> {
        let title = file_title(&self.installer(request)?);
        let dialog = self.next_request();
        let (answer, answered) = oneshot::channel();
        self.open().dialogs.insert(
            dialog,
            Dialog {
                request,
                content,
                answer,
            },
        );
        let closed = self.clone();
        let opened = SabineWindow::for_current_app()
            .map(|built| window(built, &title, dialog, parent))
            .map(|built| built.on_closed(move |_| closed.answer_dialog(dialog, None)))
            .and_then(|built| self.process().open_window(built));
        if let Err(error) = opened {
            self.open().dialogs.remove(&dialog);
            return Err(error.to_string());
        }
        Ok(answered)
    }

    fn dialog_state(&self, dialog: u32) -> Result<(u32, Content), String> {
        self.open()
            .dialogs
            .get(&dialog)
            .map(|shown| (shown.request, shown.content.clone()))
            .ok_or_else(|| luft_i18n::t!(crate::l10n::L10N, "desktop-window-closed"))
    }

    fn answer_dialog(&self, dialog: u32, answer: Option<bool>) {
        if let Some(shown) = self.open().dialogs.remove(&dialog) {
            let _ = shown.answer.send(answer);
        }
    }
}

async fn open(windows: Windows, request: Open) -> Result<Option<bool>, String> {
    let answered = windows.open_dialog(request)?;
    Ok(answered.await.ok().flatten())
}

async fn state(windows: Windows, Shown { dialog }: Shown) -> Result<DialogState, String> {
    let (request, dialog) = windows.dialog_state(dialog)?;
    Ok(DialogState {
        appearance: Appearance::current().await,
        path: windows.installer(request)?,
        dialog,
    })
}

pub fn register(window: SabineWindow, windows: &Windows) -> SabineWindow {
    window
        .with_async("install_dialog_open", windows, open)
        .with_async("install_dialog_state", windows, state)
        .with(
            "install_dialog_answer",
            windows,
            |windows, Answer { dialog, answer }| {
                windows.answer_dialog(dialog, Some(answer));
                Ok(())
            },
        )
}
