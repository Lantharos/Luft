use std::{
    collections::HashMap,
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, Ordering},
    },
};

use ashpd::{
    MaybeAppID, PortalError, WindowIdentifierType,
    backend::{
        Result,
        request::RequestImpl,
        screencast::{ScreencastImpl, SelectSourcesResponse},
        session::{CreateSessionResponse, SessionImpl},
    },
    desktop::{
        CreateSessionOptions, HandleToken,
        screencast::{
            CursorMode, SelectSourcesOptions, SourceType, StartCastOptions, StreamBuilder, Streams,
            StreamsBuilder,
        },
    },
};
use enumflags2::BitFlags;
use wayland_client::Connection;

use crate::{
    consent::{ConsentOutcome, RequestCancellation, request_consent},
    pipewire_cast::{CastHandle, start},
};

#[derive(Clone)]
pub struct ScreencastPortal {
    sessions: Arc<Mutex<HashMap<HandleToken, CastSession>>>,
    wayland: Connection,
}

impl ScreencastPortal {
    pub fn new(wayland: Connection) -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            wayland,
        }
    }
}

struct CastSession {
    cursor_mode: CursorMode,
    app_id: Option<String>,
    selected_output: Option<String>,
    cancelled: Arc<AtomicBool>,
    handle: Option<CastHandle>,
}

impl Drop for CastSession {
    fn drop(&mut self) {
        self.cancelled.store(true, Ordering::Release);
    }
}

#[async_trait::async_trait]
impl RequestImpl for ScreencastPortal {
    async fn close(&self, _: HandleToken) {}
}

#[async_trait::async_trait]
impl SessionImpl for ScreencastPortal {
    async fn session_closed(&self, session_token: HandleToken) -> Result<()> {
        self.sessions.lock().unwrap().remove(&session_token);
        Ok(())
    }
}

#[async_trait::async_trait]
impl ScreencastImpl for ScreencastPortal {
    fn available_source_types(&self) -> BitFlags<SourceType> {
        SourceType::Monitor.into()
    }

    fn available_cursor_mode(&self) -> BitFlags<CursorMode> {
        CursorMode::Hidden | CursorMode::Embedded
    }

    async fn create_session(
        &self,
        _: HandleToken,
        session_token: HandleToken,
        app_id: Option<MaybeAppID>,
        _: CreateSessionOptions,
    ) -> Result<CreateSessionResponse> {
        self.sessions.lock().unwrap().insert(
            session_token.clone(),
            CastSession {
                cursor_mode: CursorMode::Hidden,
                app_id: app_id
                    .map(|value| value.to_string())
                    .filter(|value| !value.trim().is_empty()),
                selected_output: None,
                cancelled: Arc::new(AtomicBool::new(false)),
                handle: None,
            },
        );
        Ok(CreateSessionResponse::new(session_token))
    }

    async fn select_sources(
        &self,
        session_token: HandleToken,
        app_id: Option<MaybeAppID>,
        options: SelectSourcesOptions,
    ) -> Result<SelectSourcesResponse> {
        if options.is_multiple().unwrap_or(false) {
            return Err(PortalError::InvalidArgument(
                "Luft currently provides one monitor per screencast session".into(),
            ));
        }
        if options
            .sources()
            .is_some_and(|sources| sources != BitFlags::from(SourceType::Monitor))
        {
            return Err(PortalError::InvalidArgument(
                "Luft currently supports monitor screencasts".into(),
            ));
        }
        let cursor_mode = options.cursor_mode().unwrap_or(CursorMode::Hidden);
        if cursor_mode == CursorMode::Metadata {
            return Err(PortalError::InvalidArgument(
                "cursor metadata mode is not advertised".into(),
            ));
        }
        let (cancelled, app_id) = {
            let mut sessions = self.sessions.lock().unwrap();
            let session = sessions
                .get_mut(&session_token)
                .ok_or_else(|| PortalError::NotFound("unknown screencast session".into()))?;
            if session.handle.is_some() {
                return Err(PortalError::Exist(
                    "screencast session is already running".into(),
                ));
            }
            session.cursor_mode = cursor_mode;
            let app_id = app_id
                .map(|value| value.to_string())
                .filter(|value| !value.trim().is_empty())
                .or_else(|| session.app_id.clone());
            (Arc::clone(&session.cancelled), app_id)
        };
        let mut request_cancellation = RequestCancellation::from_flag(Arc::clone(&cancelled));
        let result = tokio::task::spawn_blocking(move || {
            request_consent(luft_ipc::CaptureKind::ScreenCast, app_id, &cancelled)
        })
        .await;
        request_cancellation.disarm();
        let outcome = result
            .map_err(|error| PortalError::Failed(error.to_string()))?
            .map_err(|error| PortalError::Failed(error.to_string()))?;
        let ConsentOutcome::Granted(output) = outcome else {
            return Err(PortalError::Cancelled(
                "screen sharing was cancelled".into(),
            ));
        };
        let mut sessions = self.sessions.lock().unwrap();
        let session = sessions
            .get_mut(&session_token)
            .ok_or_else(|| PortalError::Cancelled("screencast session closed".into()))?;
        session.selected_output = Some(output);
        Ok(SelectSourcesResponse::default())
    }

    async fn start_cast(
        &self,
        session_token: HandleToken,
        _: Option<MaybeAppID>,
        _: Option<WindowIdentifierType>,
        _: StartCastOptions,
    ) -> Result<Streams> {
        let (cursor_mode, output, cancelled) = {
            let sessions = self.sessions.lock().unwrap();
            let session = sessions
                .get(&session_token)
                .ok_or_else(|| PortalError::NotFound("unknown screencast session".into()))?;
            if session.handle.is_some() {
                return Err(PortalError::Exist(
                    "screencast session is already running".into(),
                ));
            }
            (
                session.cursor_mode,
                session.selected_output.clone().ok_or_else(|| {
                    PortalError::InvalidArgument("screencast source was not selected".into())
                })?,
                Arc::clone(&session.cancelled),
            )
        };
        let mut request_cancellation = RequestCancellation::from_flag(Arc::clone(&cancelled));
        let wayland = self.wayland.clone();
        let cast = tokio::task::spawn_blocking(move || {
            start(
                wayland,
                &output,
                cursor_mode == CursorMode::Embedded,
                cancelled,
            )
        })
        .await
        .map_err(|error| PortalError::Failed(error.to_string()))?
        .map_err(|error| PortalError::Failed(error.to_string()))?;
        request_cancellation.disarm();
        let stream = StreamBuilder::new(cast.node_id)
            .size(Some((cast.width as i32, cast.height as i32)))
            .position(Some((0, 0)))
            .source_type(Some(SourceType::Monitor))
            .build();
        let mut sessions = self.sessions.lock().unwrap();
        let session = sessions
            .get_mut(&session_token)
            .ok_or_else(|| PortalError::Cancelled("screencast session closed".into()))?;
        session.handle = Some(cast.handle);
        Ok(StreamsBuilder::new(vec![stream]).build())
    }
}
