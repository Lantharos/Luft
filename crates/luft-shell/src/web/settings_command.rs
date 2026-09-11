pub fn settings_command(command: &str, page: &str) -> String {
    let command = command.trim();
    if command.is_empty() {
        return format!(
            "{} --settings {}",
            shell_words::quote(
                &std::env::current_exe()
                    .expect("shell executable path")
                    .to_string_lossy()
            ),
            shell_words::quote(page)
        );
    }
    let page = page.trim();
    if page.is_empty() {
        command.to_string()
    } else {
        format!("{command} {page}")
    }
}
