mod config;
mod middleware;
mod routers;
mod utils;
use std::sync::Arc;
use std::io;
use std::net::SocketAddr;
use sqlx::migrate::Migrator;
use dotenvy::dotenv;

use crate::config::AppState;
use crate::utils::{create_db_pool, create_router};

static _MIGRATOR: Migrator = sqlx::migrate!("./migrations");

#[tokio::main]
async fn main() -> io::Result<()> {
    dotenv().ok();

    let pool = create_db_pool().await;
    let app = create_router(Arc::new(AppState { db : pool.clone() }));
    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!("Server running on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.expect("Unable to bind to address {addr}");
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await
}

