use std::{env, sync::Arc};

use axum::{Router, routing::get};
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};

use crate::{config::AppState, middleware::cors::get_cors_config, routers::health::health_check};

pub fn create_router(app_state: Arc<AppState>) -> Router {
    let cors = get_cors_config();
    let router: Router = Router::new()
        .route("/api/v1/health", get(health_check))
        .with_state(app_state)
        .layer(cors);
    router
}

pub async fn create_db_pool() -> Pool<Postgres> {
    let database_url =
        env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to DB");
    pool
}