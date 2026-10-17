use std::future::Future;

use tokio::task::JoinHandle;

/// Runs `task` in the background on Sabine's async runtime.
pub fn spawn<F>(task: F) -> JoinHandle<F::Output>
where
    F: Future + Send + 'static,
    F::Output: Send + 'static,
{
    sabine::async_runtime().spawn(task)
}

/// Waits for `future` on Sabine's async runtime, from code that can't be
/// async, such as a synchronous bridge command. Never call it from async code.
pub fn block_on<F: Future>(future: F) -> F::Output {
    sabine::async_runtime().block_on(future)
}
