use std::fs;

const GPU_CODE: [&str; 9] = [
    "[nvidia",
    "[amdgpu]",
    "[radeon]",
    "[i915]",
    "[xe]",
    "[nouveau]",
    "[virtio_gpu]",
    "drm_",
    "dma_fence",
];

fn state(stat: &str) -> Option<char> {
    stat.rsplit_once(") ")?.1.chars().next()
}

fn tasks(pid: u32) -> Vec<String> {
    fs::read_dir(format!("/proc/{pid}/task"))
        .map(|entries| {
            entries
                .flatten()
                .map(|entry| entry.path().to_string_lossy().into_owned())
                .collect()
        })
        .unwrap_or_default()
}

pub fn blocked_in_gpu_driver(pid: u32) -> Vec<String> {
    tasks(pid)
        .into_iter()
        .filter_map(|task| {
            let stat = fs::read_to_string(format!("{task}/stat")).ok()?;
            (state(&stat)? == 'D').then_some(())?;
            let stack = fs::read_to_string(format!("{task}/stack")).ok()?;
            let frame = stack
                .lines()
                .find(|line| GPU_CODE.iter().any(|code| line.contains(code)))?;
            let name = fs::read_to_string(format!("{task}/comm")).unwrap_or_default();
            let function = frame.split_whitespace().nth(1).unwrap_or(frame);
            Some(format!(
                "Kestrel's {} thread was stuck in {function}",
                name.trim()
            ))
        })
        .collect()
}

pub fn is_debugged(pid: u32) -> bool {
    fs::read_to_string(format!("/proc/{pid}/status")).is_ok_and(|status| {
        status
            .lines()
            .find_map(|line| line.strip_prefix("TracerPid:"))
            .is_some_and(|tracer| tracer.trim() != "0")
    })
}

pub fn owner(pid: u32) -> Option<u32> {
    let status = fs::read_to_string(format!("/proc/{pid}/status")).ok()?;
    status
        .lines()
        .find_map(|line| line.strip_prefix("Uid:"))?
        .split_whitespace()
        .next()?
        .parse()
        .ok()
}
