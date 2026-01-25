---
title: Features - Smart Contract Registration
description: Smart contract registration in CasperLens for smart contract analysis
---

# Smart Contract Registration

Different smart contract packages (CEP-18 tokens, WASM contracts) are supported by CasperLens.

Registration of smart contract package with its corresponding package hash and a name adds it to the tracker.

The tracker will contain details on the package metadata, contract versions and their corresponding diffs and transactions.

The differences between versions of a package are stored on-chain to ensure transparency and tracking evolution of the package.

The tracker provides a centralized mechanism for monitoring lifecycle for multiple packages.

::: info Note
Currently, only smart contract packages deployed on the Testnet are supported for registration on CasperLens. Mainnet will be supported in upcoming releases.
:::
