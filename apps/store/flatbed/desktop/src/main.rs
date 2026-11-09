fn main() {
    if std::env::args().nth(1).as_deref() == Some(flatbed_lib::SANE_HELPER) {
        flatbed_lib::run_sane_helper();
    }
    flatbed_lib::run_app();
}
