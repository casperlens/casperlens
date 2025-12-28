FROM rust:alpine3.23 AS build

RUN USER=root cargo new --bin casperlens-server
WORKDIR /casperlens-server

RUN apk add --no-cache musl-dev
RUN apk add openssl
RUN apk add openssl-dev
RUN apk add pkgconfig
RUN apk add --no-cache libgcc libstdc++ build-base musl-dev
ENV PKG_CONFIG_PATH=/usr/local/lib64/pkgconfig/

COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml
COPY ./migrations ./migrations
COPY ./src ./src

RUN RUSTFLAGS="-Ctarget-feature=-crt-static" cargo build --release
RUN rm src/*.rs

FROM alpine:3.23

RUN apk add --no-cache libgcc libstdc++ openssl build-base openssl-dev pkgconfig musl-dev

COPY --from=build /casperlens-server/target/release/casperlens-server .

CMD ["./casperlens-server"]