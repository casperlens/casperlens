use sqlx::PgPool;


#[derive(Clone)]
pub(crate) struct AppState {
    pub(crate) db: PgPool,
}