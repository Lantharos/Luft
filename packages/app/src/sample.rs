const SAMPLE_SYSTEM: &str = "LUFT_SAMPLE_SYSTEM";

pub fn sample_system() -> bool {
    std::env::var_os(SAMPLE_SYSTEM).is_some()
}
