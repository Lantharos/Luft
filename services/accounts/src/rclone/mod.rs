mod process;
mod rc;

use std::path::Path;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use anyhow::{Context, Result};
use serde::Deserialize;
use serde_json::{Map, Value, json};
use tokio::sync::{broadcast, watch};
use tokio::time::timeout;

use crate::paths::Paths;
pub use rc::Rc;

const CACHE_MAX_AGE: &str = "24h";
const CACHE_MAX_SIZE: &str = "5G";
const CACHE_MIN_FREE: &str = "5G";
const WRITE_BACK: &str = "5s";
const STARTUP: Duration = Duration::from_secs(30);

#[derive(Clone)]
pub struct Rclone {
    rc: Rc,
    logs: broadcast::Sender<String>,
    pub starts: watch::Receiver<u64>,
    idle: Arc<Mutex<Option<process::Process>>>,
}

#[derive(Deserialize)]
pub struct Queued {
    pub name: String,
    pub id: i64,
    pub expiry: f64,
    pub uploading: bool,
}

#[derive(Deserialize)]
pub struct Question {
    #[serde(rename = "State", default)]
    pub state: String,
    #[serde(rename = "Option", default)]
    pub option: Option<QuestionOption>,
    #[serde(rename = "Error", default)]
    pub error: String,
}

#[derive(Deserialize)]
pub struct QuestionOption {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Help", default)]
    pub help: String,
    #[serde(rename = "Examples", default)]
    pub examples: Option<Vec<Example>>,
}

#[derive(Deserialize)]
pub struct Example {
    #[serde(rename = "Value")]
    pub value: String,
    #[serde(rename = "Help")]
    pub help: String,
}

impl Rclone {
    pub fn prepare(paths: &Paths) -> Result<Self> {
        let (process, logs, starts) =
            process::Process::prepare(paths.runtime.clone(), paths.socket(), paths.cache.clone())?;
        Ok(Self {
            rc: Rc::new(paths.socket()),
            logs,
            starts,
            idle: Arc::new(Mutex::new(Some(process))),
        })
    }

    pub fn start(&self) {
        if let Some(process) = self.idle.lock().expect("never poisoned").take() {
            tokio::spawn(process.supervise());
        }
    }

    pub fn started(&self) -> bool {
        *self.starts.borrow() > 0
    }

    async fn call(&self, method: &str, input: Value) -> Result<Value> {
        self.start();
        timeout(STARTUP, self.starts.clone().wait_for(|starts| *starts > 0))
            .await
            .context("rclone didn't start")??;
        self.rc.call(method, input).await
    }

    pub fn logs(&self) -> broadcast::Receiver<String> {
        self.logs.subscribe()
    }

    pub async fn configure(
        &self,
        name: &str,
        kind: &str,
        parameters: Map<String, Value>,
        opt: Value,
    ) -> Result<Question> {
        let answer = self
            .call(
                "config/create",
                json!({"name": name, "type": kind, "parameters": parameters, "opt": opt}),
            )
            .await?;
        Ok(serde_json::from_value(answer)?)
    }

    pub async fn continue_configuring(
        &self,
        name: &str,
        state: &str,
        result: &str,
    ) -> Result<Question> {
        self.update_configuring(name, Map::new(), state, result)
            .await
    }

    pub async fn update_configuring(
        &self,
        name: &str,
        parameters: Map<String, Value>,
        state: &str,
        result: &str,
    ) -> Result<Question> {
        let answer = self.call(
                "config/update",
                json!({"name": name, "parameters": parameters, "opt": {"continue": true, "state": state, "result": result}}),
            )
            .await?;
        Ok(serde_json::from_value(answer)?)
    }

    pub async fn remote(&self, name: &str) -> Result<Map<String, Value>> {
        let answer = self.call("config/get", json!({"name": name})).await?;
        Ok(answer.as_object().cloned().unwrap_or_default())
    }

    pub async fn forget_remote(&self, name: &str) -> Result<()> {
        self.call("config/delete", json!({"name": name})).await?;
        Ok(())
    }

    pub async fn mount(&self, fs: &str, at: &Path, volume: &str) -> Result<()> {
        self.call(
            "mount/mount",
            json!({
                "fs": fs,
                "mountPoint": at,
                "vfsOpt": {
                    "CacheMode": "full",
                    "CacheMaxAge": CACHE_MAX_AGE,
                    "CacheMaxSize": CACHE_MAX_SIZE,
                    "CacheMinFreeSpace": CACHE_MIN_FREE,
                    "WriteBack": WRITE_BACK,
                },
                "mountOpt": {"VolumeName": volume},
            }),
        )
        .await?;
        Ok(())
    }

    pub async fn unmount(&self, at: &Path) -> Result<()> {
        self.call("mount/unmount", json!({"mountPoint": at}))
            .await?;
        Ok(())
    }

    pub async fn unmount_all(&self) -> Result<()> {
        if !self.started() {
            return Ok(());
        }
        self.call("mount/unmountall", json!({})).await?;
        Ok(())
    }

    pub async fn queue(&self, fs: &str) -> Result<Vec<Queued>> {
        let answer = self.call("vfs/queue", json!({"fs": fs})).await?;
        Ok(serde_json::from_value(answer["queue"].clone()).unwrap_or_default())
    }

    pub async fn hold_upload(&self, fs: &str, id: i64, seconds: f64) -> Result<()> {
        self.call(
            "vfs/queue-set-expiry",
            json!({"fs": fs, "id": id, "expiry": seconds}),
        )
        .await?;
        Ok(())
    }

    pub async fn forget(&self, fs: &str, folder: &str) -> Result<()> {
        let mut input = json!({"fs": fs});
        if !folder.is_empty() {
            input["dir"] = Value::String(folder.to_owned());
        }
        self.call("vfs/forget", input).await?;
        Ok(())
    }

    pub async fn refresh(&self, fs: &str) -> Result<()> {
        self.call("vfs/refresh", json!({"fs": fs})).await?;
        Ok(())
    }

    pub async fn about(&self, fs: &str) -> Result<Value> {
        self.call("operations/about", json!({"fs": fs})).await
    }

    pub async fn list_top(&self, fs: &str) -> Result<()> {
        self.call(
            "operations/list",
            json!({"fs": fs, "remote": "", "opt": {"dirsOnly": true}}),
        )
        .await?;
        Ok(())
    }

    pub async fn public_link(&self, fs: &str, remote: &str) -> Result<String> {
        let answer = self
            .call("operations/publiclink", json!({"fs": fs, "remote": remote}))
            .await?;
        Ok(answer["url"].as_str().unwrap_or_default().to_owned())
    }

    pub async fn bisync(&self, input: Value) -> Result<()> {
        self.call("sync/bisync", input).await?;
        Ok(())
    }
}
