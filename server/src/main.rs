mod config;
mod constants;
mod middleware;
mod models;
mod routers;
mod utils;
mod services;
use std::sync::Arc;
use std::io;
use std::net::SocketAddr;
use sqlx::migrate::Migrator;
use dotenvy::dotenv;
use tower_http::trace::TraceLayer;
use tracing::Level;

use crate::config::AppState;
use crate::utils::{create_db_pool, create_router};

static _MIGRATOR: Migrator = sqlx::migrate!("./migrations");

#[tokio::main]
async fn main() -> io::Result<()> {
    tracing_subscriber::fmt()
        .with_max_level(Level::DEBUG)
        .with_level(true)
        .init();
    dotenv().ok();
    let pool = create_db_pool().await;
    let app = create_router(Arc::new(AppState { db : pool.clone(), config: config::load_config() }));
    let app = app.layer(TraceLayer::new_for_http());
    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!("Server running on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.expect("Unable to bind to address {addr}");
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await
}

