use std::fs::{self, File};
use std::io::{self, Read, Seek};
use std::path::PathBuf;

pub struct Cgroup(PathBuf);

impl Cgroup {
    pub fn own() -> io::Result<Self> {
        let membership = fs::read_to_string("/proc/self/cgroup")?;
        let path = membership
            .lines()
            .find_map(|line| line.strip_prefix("0::"))
            .ok_or_else(|| {
                io::Error::other("this system doesn't use a unified cgroup hierarchy")
            })?;
        Ok(Self(
            PathBuf::from("/sys/fs/cgroup").join(path.trim_start_matches('/')),
        ))
    }

    pub fn child(&self, name: &str) -> io::Result<Self> {
        let path = self.0.join(name);
        fs::create_dir(&path)?;
        Ok(Self(path))
    }

    pub fn adopt(&self, pid: u32) -> io::Result<()> {
        fs::write(self.0.join("cgroup.procs"), pid.to_string())
    }

    pub fn events(&self) -> io::Result<File> {
        File::open(self.0.join("cgroup.events"))
    }

    pub fn kill(&self) -> io::Result<()> {
        fs::write(self.0.join("cgroup.kill"), "1")
    }
}

pub fn populated(events: &mut File) -> io::Result<bool> {
    let mut text = String::new();
    events.rewind()?;
    events.read_to_string(&mut text)?;
    Ok(text.lines().any(|line| line == "populated 1"))
}
