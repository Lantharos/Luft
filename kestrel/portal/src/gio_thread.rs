use std::future::Future;

use tokio::sync::oneshot;

#[derive(Clone)]
pub struct GioThread {
    context: glib::MainContext,
}

impl GioThread {
    pub fn start() -> Self {
        let context = glib::MainContext::new();
        let thread_context = context.clone();
        std::thread::Builder::new()
            .name("gio".into())
            .spawn(move || {
                thread_context
                    .with_thread_default(|| glib::MainLoop::new(Some(&thread_context), false).run())
                    .expect("the GIO thread owns its main context");
            })
            .expect("the GIO thread starts");
        Self { context }
    }

    pub async fn run<T: Send + 'static>(&self, work: impl FnOnce() -> T + Send + 'static) -> T {
        let (reply, answer) = oneshot::channel();
        self.context.invoke(move || {
            let _ = reply.send(work());
        });
        answer.await.expect("the GIO thread answers")
    }

    pub async fn run_async<T, F>(&self, work: impl FnOnce() -> F + Send + 'static) -> T
    where
        T: Send + 'static,
        F: Future<Output = T> + 'static,
    {
        let (reply, answer) = oneshot::channel();
        let context = self.context.clone();
        self.context.invoke(move || {
            context.spawn_local(async move {
                let _ = reply.send(work().await);
            });
        });
        answer.await.expect("the GIO thread answers")
    }
}
