use std::{env, fs::File, io::Write};

use base64::Engine;
use dotenvy::dotenv;
use log::info;
use sqlx::PgPool;

use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub(crate) database_url: String,
    pub(crate) _jwt_secret: String,
    pub(crate) web_url: String,
    pub(crate) mainnet_node_address: String,
    pub(crate) testnet_node_address: String,
    pub(crate) huggingface_token: String,
    pub(crate) secret_key: String,
    pub(crate) observability_package_hash: String,
}

pub fn load_config() -> Config {
    dotenv().ok();
    write_secret_file();
    Config {
        database_url: env::var("DATABASE_URL").expect("DATABASE_URL is not set in .env"),
        _jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET is not set in .env"),
        web_url: env::var("WEB_URL").unwrap_or("http://localhost:3000".to_string()),
        mainnet_node_address: env::var("MAINNET_NODE_ADDRESS")
            .unwrap_or("https://node.mainnet.casper.network".to_string()),
        testnet_node_address: env::var("TESTNET_NODE_ADDRESS")
            .unwrap_or("https://node.testnet.casper.network".to_string()),
        huggingface_token: env::var("HUGGINGFACE_TOKEN").expect("HUGGINGFACE_TOKEN is not set"),
        secret_key: env::var("SECRET_KEY").expect("SECRET_KEY is not set"),
        observability_package_hash: env::var("OBSERVABILITY_PACKAGE_HASH")
            .expect("OBSERVABILITY_PACKAGE_HASH is not set"),
    }
}

fn write_secret_file() {
    match env::var("SECRET_KEY") {
        Ok(base64_string) => {
            let cleaned_string = base64_string.replace('\n', "").replace(' ', "");
            match base64::engine::general_purpose::STANDARD.decode(cleaned_string) {
                Ok(decoded_bytes) => {
                    let mut file = match File::create("./secret-key.pem") {
                        Ok(f) => f,
                        Err(e) => {
                            panic!("Error creating file: {}", e);
                        }
                    };

                    if let Err(e) = file.write_all(&decoded_bytes) {
                        panic!("Error writing to file: {}", e);
                    } else {
                        info!("PEM file written successfully!");
                    }
                }
                Err(e) => panic!("Error decoding Base64 string: {}", e),
            }
        }
        Err(_) => panic!("Environment variable 'SECRET_KEY' not found."),
    }
}

#[derive(Clone)]
pub(crate) struct AppState {
    pub(crate) db: PgPool,
    pub(crate) config: Config,
}
