//! luft for AI agents, over the Model Context Protocol on standard input and
//! output: `luft mcp` is what an agent is pointed at.

mod tools;

use std::sync::Arc;

use rmcp::model::{
    CallToolRequestParams, CallToolResponse, CallToolResult, ContentBlock, Implementation,
    ListToolsResult, PaginatedRequestParams, ServerCapabilities, ServerConfig, Tool,
    ToolAnnotations,
};
use rmcp::service::RequestContext;
use rmcp::{ErrorData, RoleServer, ServerHandler, ServiceExt};
use serde_json::Value as Json;

use crate::failure::{Failure, Outcome};

const INSTRUCTIONS: &str = "luft changes Luft's settings for the person you work for and reads how the system is. \
Read describe_settings first, then make every change they asked for in one propose_changes call. \
System settings wait for the person to approve the whole set on their screen: nothing you send can skip that, \
so describe in your reply what you proposed, and respect a declined review.";

struct Luft;

fn listed(tool: &tools::Tool) -> Tool {
    let schema = match (tool.schema)() {
        Json::Object(schema) => schema,
        _ => serde_json::Map::new(),
    };
    let mut listed = Tool::new(tool.name, tool.description, Arc::new(schema));
    listed.annotations = Some(
        ToolAnnotations::new()
            .read_only(!tool.writes)
            .destructive(false),
    );
    listed
}

fn answer(result: Outcome<Json>) -> CallToolResult {
    match result {
        Ok(value) => {
            let mut done = CallToolResult::success(vec![ContentBlock::text(
                serde_json::to_string_pretty(&value).unwrap_or_default(),
            )]);
            done.structured_content = Some(value);
            done
        }
        Err(Failure { exit, message }) => CallToolResult::error(vec![ContentBlock::text(format!(
            "{message} (exit {})",
            exit as u8
        ))]),
    }
}

impl ServerHandler for Luft {
    fn get_info(&self) -> ServerConfig {
        ServerConfig::new(ServerCapabilities::builder().enable_tools().build())
            .with_server_info(Implementation::new("luft", env!("CARGO_PKG_VERSION")))
            .with_instructions(INSTRUCTIONS)
    }

    async fn list_tools(
        &self,
        _request: Option<PaginatedRequestParams>,
        _context: RequestContext<RoleServer>,
    ) -> Result<ListToolsResult, ErrorData> {
        Ok(ListToolsResult::with_all_items(
            tools::TOOLS.iter().map(listed).collect(),
        ))
    }

    async fn call_tool(
        &self,
        request: CallToolRequestParams,
        _context: RequestContext<RoleServer>,
    ) -> Result<CallToolResponse, ErrorData> {
        Ok(answer(tools::call(&request.name, request.arguments.unwrap_or_default()).await).into())
    }
}

pub fn serve() -> Outcome {
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .enable_all()
        .build()?;
    runtime.block_on(async {
        let running = Luft
            .serve(rmcp::transport::stdio())
            .await
            .map_err(|error| Failure::failed(error.to_string()))?;
        running
            .waiting()
            .await
            .map_err(|error| Failure::failed(error.to_string()))?;
        Ok(())
    })
}
