use std::io::{BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::{Arc, Mutex};

use serde_json::Value;

use crate::fixtures::SESSION;
use crate::routes;
use crate::state::State;

pub struct Request {
    pub method: String,
    pub path: Vec<String>,
    pub query: String,
    pub body: Value,
}

pub struct Response {
    pub status: u16,
    pub body: Value,
}

impl Response {
    pub fn ok(body: Value) -> Self {
        Self { status: 200, body }
    }

    pub fn refused(status: u16, error: &str) -> Self {
        Self {
            status,
            body: serde_json::json!({ "error": error }),
        }
    }
}

fn reason(status: u16) -> &'static str {
    match status {
        200 => "OK",
        201 => "Created",
        204 => "No Content",
        401 => "Unauthorized",
        403 => "Forbidden",
        404 => "Not Found",
        _ => "Unprocessable Content",
    }
}

fn read(stream: &TcpStream) -> std::io::Result<(Request, bool)> {
    let mut reader = BufReader::new(stream);
    let mut line = String::new();
    reader.read_line(&mut line)?;
    let mut words = line.split_whitespace();
    let method = words.next().unwrap_or_default().to_owned();
    let target = words.next().unwrap_or_default().to_owned();
    let mut length = 0;
    let mut signed = false;
    loop {
        let mut header = String::new();
        reader.read_line(&mut header)?;
        let header = header.trim_end();
        if header.is_empty() {
            break;
        }
        let (name, value) = header.split_once(':').unwrap_or((header, ""));
        match name.to_ascii_lowercase().as_str() {
            "content-length" => length = value.trim().parse().unwrap_or(0),
            "authorization" => signed = value.trim() == format!("Bearer {SESSION}"),
            _ => {}
        }
    }
    let mut body = vec![0; length];
    reader.read_exact(&mut body)?;
    let (path, query) = target.split_once('?').unwrap_or((&target, ""));
    let request = Request {
        method,
        path: path
            .split('/')
            .filter(|segment| !segment.is_empty())
            .map(|segment| segment.replace("%2F", "/"))
            .collect(),
        query: query.to_owned(),
        body: serde_json::from_slice(&body).unwrap_or(Value::Null),
    };
    Ok((request, signed))
}

fn answer(mut stream: TcpStream, state: &Mutex<State>) -> std::io::Result<()> {
    let (request, signed) = read(&stream)?;
    let response = if signed {
        routes::handle(&mut state.lock().expect("the store's lock"), &request)
    } else {
        Response::refused(401, "Sign in first")
    };
    eprintln!(
        "{} /{} {}",
        request.method,
        request.path.join("/"),
        response.status
    );
    let text = if response.status == 204 {
        String::new()
    } else {
        response.body.to_string()
    };
    write!(
        stream,
        "HTTP/1.1 {} {}\r\ncontent-type: application/json\r\ncontent-length: {}\r\nconnection: close\r\n\r\n{text}",
        response.status,
        reason(response.status),
        text.len()
    )
}

pub fn serve(listener: &TcpListener, state: &Arc<Mutex<State>>) {
    for stream in listener.incoming().flatten() {
        let state = Arc::clone(state);
        std::thread::spawn(move || {
            if let Err(error) = answer(stream, &state) {
                eprintln!("A request failed: {error}");
            }
        });
    }
}
