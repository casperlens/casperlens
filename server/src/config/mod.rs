use std::env;

use dotenvy::dotenv;
use sqlx::PgPool;

use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub(crate) database_url: String,
    pub(crate) jwt_secret: String,
    pub(crate) web_url: String,
    pub(crate) mainnet_node_address: String,
    pub(crate) testnet_node_address: String,
}

pub fn load_config() -> Config {
    dotenv().ok();

    let config = Config {
        database_url: env::var("DATABASE_URL").expect("DATABASE_URL is not set in .env"),
        jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET is not set in .env"),
        web_url: env::var("WEB_URL").unwrap_or("http://localhost:3000".to_string()),
        mainnet_node_address: env::var("MAINNET_NODE_ADDRESS").unwrap_or("https://node.mainnet.casper.network".to_string()),
        testnet_node_address: env::var("TESTNET_NODE_ADDRESS").unwrap_or("https://node.testnet.casper.network".to_string()),
    };
    config
}

#[derive(Clone)]
pub(crate) struct AppState {
    pub(crate) db: PgPool,
    pub(crate) config: Config
}