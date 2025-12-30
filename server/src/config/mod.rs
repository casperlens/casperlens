use std::env;

use dotenvy::dotenv;
use sqlx::PgPool;

use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
struct Config {
    pub(crate) database_url: String,
    pub(crate) jwt_secret: String,
    pub(crate) web_url: String,
    pub(crate) node_address: String,
}

fn load_config() -> Config {
    dotenv().ok();

    let config = Config {
        database_url: env::var("DATABASE_URL").expect("DATABASE_URL is not set in .env"),
        jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET is not set in .env"),
        web_url: env::var("WEB_URL").expect("WEB_URL is not set in .env"),
        node_address: env::var("NODE_ADDRESS").expect("NODE_ADDRESS is not set in .env"),
    };
    config
}

#[derive(Clone)]
pub(crate) struct AppState {
    pub(crate) db: PgPool,
    pub(crate) config: Config
}