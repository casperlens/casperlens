# CasperLens Server

The server for CasperLens, a smart contract lifecycle management and observability platform for Casper Network.

# Usage

1. Install the project using Cargo:
    ```sh
    cargo install casperlens-server
    ```
2. Run the project. Ensure `~/.cargo/bin` is in `PATH`:
    ```sh
    casperlens-server
    ```

# Development

1. Clone the repository:
    ```sh
    git clone https://github.com/casperlens/casperlens
    cd casperlens/server
    ```
2. Install dependencies and build the server:
    ```sh
    cargo build
    ```
3. Run the server:
    ```sh
    cargo dev
    ```

# Documentation

Documentation is available at https://docs.rs/casperlens

# License

CasperLens is licensed under Apache-2.0 license.