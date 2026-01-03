use axum::http::{Method, header};
use tower_http::cors::CorsLayer;

use crate::config;

pub fn get_cors_config() -> CorsLayer {
    let config = config::load_config();
    let web_url = config.web_url.clone();
    let allowed_origins = vec![web_url.parse().unwrap()];

    let allowed_methods = vec![Method::GET, Method::POST, Method::OPTIONS];

    let allowed_headers = vec![
        header::COOKIE,
        header::SET_COOKIE,
        header::CONTENT_LENGTH,
        header::CONTENT_TYPE,
        header::ACCESS_CONTROL_ALLOW_ORIGIN,
        header::ACCESS_CONTROL_ALLOW_HEADERS,
        header::ACCESS_CONTROL_ALLOW_CREDENTIALS,
        header::ACCESS_CONTROL_ALLOW_METHODS,
        "Credentials".parse().unwrap(),
    ];

    CorsLayer::new()
        .allow_origin(allowed_origins)
        .allow_methods(allowed_methods)
        .allow_headers(allowed_headers)
        .allow_credentials(true)
}
