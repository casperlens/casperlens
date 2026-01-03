use crate::{
    config::{self, AppState},
    middleware::cors::get_cors_config,
    routers::{contract::register_contract, health::health_check},
};
use axum::{
    Router,
    routing::{get, post},
};
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};
use std::sync::Arc;

pub fn create_router(app_state: Arc<AppState>) -> Router {

    let cors = get_cors_config();
    let router: Router = Router::new()
        .route("/api/v1/health", get(health_check))
        .route(
            "/api/v1/u/{user_id}/contract/register",
            post(register_contract),
        )
        .with_state(app_state)
        .layer(cors);
    router
}

pub async fn create_db_pool() -> Pool<Postgres> {
    let config = config::load_config();
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to DB");
    pool
}
