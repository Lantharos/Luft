use convertible_lib::{run_app, worker};

fn main() {
    if std::env::args().nth(1).as_deref() == Some(worker::ARGUMENT) {
        worker::run();
    } else {
        run_app();
    }
}
