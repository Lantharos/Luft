use std::future::Future;
use std::sync::OnceLock;

use tokio::runtime::{Builder, Handle, Runtime};
use tokio::task::JoinHandle;

static HANDLE: OnceLock<Handle> = OnceLock::new();

/// The Tokio runtime the connections and background work of this process
/// live on: the one `adopt` was given first, or one of its own.
pub fn handle() -> &'static Handle {
    HANDLE.get_or_init(|| {
        static OWN: OnceLock<Runtime> = OnceLock::new();
        OWN.get_or_init(|| {
            Builder::new_multi_thread()
                .thread_name("luft-async")
                .enable_all()
                .build()
                .expect("the async runtime starts")
        })
        .handle()
        .clone()
    })
}

/// Makes `runtime`, such as an app framework's own, the process's runtime,
/// unless something already ran on another.
pub fn adopt(runtime: impl FnOnce() -> &'static Handle) -> &'static Handle {
    HANDLE.get_or_init(|| runtime().clone())
}

pub fn spawn<F>(task: F) -> JoinHandle<F::Output>
where
    F: Future + Send + 'static,
    F::Output: Send + 'static,
{
    handle().spawn(task)
}

/// Waits for `future` from code that can't be async. Never call it from
/// async code.
pub fn block_on<F: Future>(future: F) -> F::Output {
    handle().block_on(future)
}
