# Pre-requisites

## Server

- Rust (with nightly build)
- Cargo (with `Clippy` and `rustfmt`)
- `sqlx` CLI (install using `cargo install sqlx`)

## Web

- `bun` for package and project management

## Smart Contract

- `odra-cli`
- `casper-client` CLI

# Getting Started

1. Clone repository

```sh
git clone https://github.com/casperlens/casperlens
```

2. Set up environment variables for frontend and backend from `.env.sample`
3. Install dependencies and build backend using `cargo build`
4. Run the backend using `cargo run`
5. Install dependencies for frontend using `bun install`
6. Run frontend using `bun run dev` in `frontend/`
