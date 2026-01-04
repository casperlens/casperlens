{
  description = "Development Environment Flake";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-25.11";
    nixpkgs-unstb.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, nixpkgs-unstb, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
     	let
    		pkgs = nixpkgs.legacyPackages.${system};
    		unstb = nixpkgs-unstb.legacyPackages.${system};
     	in {
        devShells.default = pkgs.mkShell {
          NIX_SHELL_NAME="CASPER";
          RUST_SRC_PATH="${pkgs.rust.packages.stable.rustPlatform.rustLibSrc}";
          OPENSSL_NO_VENDOR="1";
         	packages = with unstb; [
         	  # Rust
       	    rustc
       	    cargo
       	    clippy
       	    rustfmt
       	    rust-analyzer
       	    rustup
       	    pkg-config
            openssl.dev

       	    # Javascript
       	    bun
         	];
        };
      }
    );
}
