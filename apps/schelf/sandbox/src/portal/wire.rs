use std::io;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd, RawFd};
use std::os::unix::net::UnixStream;

const MOST_FDS: usize = 253;
const CHUNK: usize = 64 << 10;

fn control_space() -> usize {
    unsafe { libc::CMSG_SPACE((MOST_FDS * size_of::<RawFd>()) as u32) as usize }
}

/// Reads one end of a connection, reusing its buffers for every read.
pub struct Receiver {
    chunk: Vec<u8>,
    control: Vec<u8>,
}

impl Default for Receiver {
    fn default() -> Self {
        Self {
            chunk: vec![0; CHUNK],
            control: vec![0; control_space()],
        }
    }
}

impl Receiver {
    /// Reads what arrived on `stream` into `bytes`, and the file descriptors
    /// sent with it into `fds`. Returns false once the other end has closed.
    pub fn receive(
        &mut self,
        stream: &UnixStream,
        bytes: &mut Vec<u8>,
        fds: &mut Vec<OwnedFd>,
    ) -> io::Result<bool> {
        let mut vector = libc::iovec {
            iov_base: self.chunk.as_mut_ptr().cast(),
            iov_len: self.chunk.len(),
        };
        let mut header: libc::msghdr = unsafe { std::mem::zeroed() };
        header.msg_iov = &raw mut vector;
        header.msg_iovlen = 1;
        header.msg_control = self.control.as_mut_ptr().cast();
        header.msg_controllen = self.control.len() as _;
        let read = loop {
            let read = unsafe {
                libc::recvmsg(stream.as_raw_fd(), &raw mut header, libc::MSG_CMSG_CLOEXEC)
            };
            if read >= 0 {
                break read as usize;
            }
            let error = io::Error::last_os_error();
            if error.kind() != io::ErrorKind::Interrupted {
                return Err(error);
            }
        };
        let mut message = unsafe { libc::CMSG_FIRSTHDR(&raw const header) };
        while !message.is_null() {
            let control = unsafe { &*message };
            if control.cmsg_level == libc::SOL_SOCKET && control.cmsg_type == libc::SCM_RIGHTS {
                let data = unsafe { libc::CMSG_DATA(message) }.cast::<RawFd>();
                let count = (control.cmsg_len as usize - unsafe { libc::CMSG_LEN(0) } as usize)
                    / size_of::<RawFd>();
                for index in 0..count {
                    let fd = unsafe { data.add(index).read_unaligned() };
                    fds.push(unsafe { OwnedFd::from_raw_fd(fd) });
                }
            }
            message = unsafe { libc::CMSG_NXTHDR(&raw const header, message) };
        }
        bytes.extend_from_slice(&self.chunk[..read]);
        Ok(read > 0)
    }
}

/// Writes `bytes` to `stream`, sending `fds` along with the first of them.
pub fn send(stream: &UnixStream, bytes: &[u8], fds: &[OwnedFd]) -> io::Result<()> {
    let mut written = 0;
    let mut pending: &[OwnedFd] = fds;
    while written < bytes.len() {
        let rest = &bytes[written..];
        let mut vector = libc::iovec {
            iov_base: rest.as_ptr().cast_mut().cast(),
            iov_len: rest.len(),
        };
        let mut header: libc::msghdr = unsafe { std::mem::zeroed() };
        header.msg_iov = &raw mut vector;
        header.msg_iovlen = 1;
        let mut control = Vec::new();
        if !pending.is_empty() {
            let size = pending.len() * size_of::<RawFd>();
            control = vec![0u8; unsafe { libc::CMSG_SPACE(size as u32) } as usize];
            header.msg_control = control.as_mut_ptr().cast();
            header.msg_controllen = control.len() as _;
            unsafe {
                let message = libc::CMSG_FIRSTHDR(&raw const header);
                (*message).cmsg_level = libc::SOL_SOCKET;
                (*message).cmsg_type = libc::SCM_RIGHTS;
                (*message).cmsg_len = libc::CMSG_LEN(size as u32) as _;
                let data = libc::CMSG_DATA(message).cast::<RawFd>();
                for (index, fd) in pending.iter().enumerate() {
                    data.add(index).write_unaligned(fd.as_raw_fd());
                }
            }
        }
        let sent =
            unsafe { libc::sendmsg(stream.as_raw_fd(), &raw const header, libc::MSG_NOSIGNAL) };
        drop(control);
        if sent < 0 {
            let error = io::Error::last_os_error();
            if error.kind() == io::ErrorKind::Interrupted {
                continue;
            }
            return Err(error);
        }
        pending = &[];
        written += sent as usize;
    }
    Ok(())
}
