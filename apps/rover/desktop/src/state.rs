use std::sync::Arc;

use parking_lot::RwLock;

use crate::{chooser, launch_args, operations_queue, settings, vcs, APP_NAME};

#[derive(Clone)]
pub(crate) struct RoverState {
    pub(crate) queue: operations_queue::OperationsQueue,
    pub(crate) settings: Arc<RwLock<settings::Settings>>,
    pub(crate) chooser: Arc<chooser::ChooserState>,
    pub(crate) vcs_jobs: vcs::VcsJobs,
    pub(crate) launch_paths: Vec<String>,
}

impl RoverState {
    pub(crate) fn new(args: &[String]) -> Self {
        Self {
            queue: operations_queue::OperationsQueue::new(),
            settings: Arc::new(RwLock::new(settings::Settings::load_or_default())),
            chooser: Arc::new(chooser::ChooserState::new(
                chooser::ChooserSession::from_environment(),
            )),
            vcs_jobs: vcs::VcsJobs::default(),
            launch_paths: launch_args::paths(args),
        }
    }

    pub(crate) fn title(&self) -> String {
        let config = self.chooser.config();
        if config.active && !config.title.is_empty() {
            config.title
        } else {
            APP_NAME.to_string()
        }
    }
}
