mod assuan;
mod cache;
mod kestrel;
mod session;

use std::io::{self, BufReader};
use std::os::unix::process::CommandExt;
use std::path::Path;
use std::process::{Command, ExitCode};

use assuan::Assuan;
use kestrel::Kestrel;
use session::{Next, Session};

const FALLBACKS: [&str; 3] = [
    "/usr/bin/pinentry",
    "/usr/bin/pinentry-curses",
    "/usr/bin/pinentry-tty",
];

fn hand_over() -> ExitCode {
    let arguments: Vec<_> = std::env::args_os().skip(1).collect();
    for program in FALLBACKS
        .iter()
        .filter(|program| Path::new(program).exists())
    {
        let error = Command::new(program).args(&arguments).exec();
        eprintln!("{program} couldn't take over: {error}");
    }
    eprintln!("Neither Kestrel nor another pinentry is available");
    ExitCode::FAILURE
}

fn serve(kestrel: &Kestrel) -> io::Result<()> {
    let mut assuan = Assuan::new(BufReader::new(io::stdin().lock()), io::stdout().lock());
    let mut session = Session::default();
    assuan.greet()?;
    while let Some(line) = assuan.read_line()? {
        if line.first() == Some(&b'#') {
            continue;
        }
        if let Next::Finish = session.handle(kestrel, &mut assuan, &line)? {
            break;
        }
    }
    Ok(())
}

fn main() -> ExitCode {
    let Some(kestrel) = Kestrel::connect() else {
        return hand_over();
    };
    let served = serve(&kestrel);
    kestrel.close();
    match served {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("The conversation with GnuPG broke off: {error}");
            ExitCode::FAILURE
        }
    }
}
